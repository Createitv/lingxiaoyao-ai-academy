import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { rateLimit } from "@/lib/rate-limit";
import {
  getWechatPayConfig,
  generateAuthHeader,
  generatePaymentSign,
} from "@/lib/wechat-pay/sdk";

const SAFE_SLUG_RE = /^[a-zA-Z0-9_-]+$/;

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: "请先登录" },
      { status: 401 },
    );
  }

  if (
    !rateLimit(`order-create:${user.id}`, { maxRequests: 5, windowMs: 60_000 })
  ) {
    return NextResponse.json(
      { success: false, error: "操作过于频繁，请稍后再试" },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "请求格式错误" },
      { status: 400 },
    );
  }

  const { courseSlug } = body as { courseSlug?: string };

  if (!courseSlug || !SAFE_SLUG_RE.test(courseSlug)) {
    return NextResponse.json(
      { success: false, error: "缺少或无效的 courseSlug 参数" },
      { status: 400 },
    );
  }

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
  });
  if (!course) {
    return NextResponse.json(
      { success: false, error: "课程不存在" },
      { status: 404 },
    );
  }

  // Free course: grant access directly
  if (course.price === 0) {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: user.id,
          courseId: course.id,
          status: "paid",
          amount: 0,
        },
      });
      await tx.userCourse.upsert({
        where: {
          userId_courseId: { userId: user.id, courseId: course.id },
        },
        update: {},
        create: { userId: user.id, courseId: course.id, orderId: order.id },
      });
      return order;
    });
    return NextResponse.json({
      success: true,
      data: { orderId: result.id, status: "paid" },
    });
  }

  // Check if already purchased
  const existing = await prisma.userCourse.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
  });
  if (existing) {
    return NextResponse.json(
      { success: false, error: "已购买该课程" },
      { status: 400 },
    );
  }

  // Get WeChat Pay config
  const config = getWechatPayConfig();
  if (!config) {
    console.error("[Orders] WeChat Pay credentials missing");
    return NextResponse.json(
      { success: false, error: "支付配置异常，请联系客服" },
      { status: 503 },
    );
  }

  // Create pending order
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      courseId: course.id,
      status: "pending",
      amount: course.price,
    },
  });

  // Get user's mini program openid for WeChat Pay
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser?.miniProgramOpenId) {
    return NextResponse.json(
      { success: false, error: "请先完成微信登录" },
      { status: 400 },
    );
  }

  // Call WeChat Pay JSAPI unified order API
  const apiUrl = "/v3/pay/transactions/jsapi";
  const requestBody = JSON.stringify({
    appid: config.appId,
    mchid: config.mchId,
    description: course.title,
    out_trade_no: order.id,
    notify_url: process.env.WECHAT_PAY_NOTIFY_URL,
    amount: {
      total: course.price, // in cents (分)
      currency: "CNY",
    },
    payer: {
      openid: dbUser.miniProgramOpenId,
    },
  });

  const authHeader = generateAuthHeader("POST", apiUrl, requestBody, config);

  try {
    const res = await fetch(`https://api.mch.weixin.qq.com${apiUrl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: authHeader,
      },
      body: requestBody,
      signal: AbortSignal.timeout(10_000),
    });

    const data = await res.json();

    if (!res.ok || !data.prepay_id) {
      console.error("[WeChat Pay] Unified order failed:", data);
      return NextResponse.json(
        { success: false, error: "创建支付订单失败，请重试" },
        { status: 500 },
      );
    }

    // Generate payment params for mini program wx.requestPayment
    const paymentSign = generatePaymentSign(data.prepay_id, config);

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        status: "pending",
        payment: {
          timeStamp: paymentSign.timeStamp,
          nonceStr: paymentSign.nonceStr,
          package: `prepay_id=${data.prepay_id}`,
          signType: "RSA",
          paySign: paymentSign.paySign,
        },
      },
    });
  } catch (err) {
    console.error(
      "[WeChat Pay] Error:",
      err instanceof Error ? err.message : "unknown",
    );
    return NextResponse.json(
      { success: false, error: "支付服务异常，请稍后重试" },
      { status: 500 },
    );
  }
}
