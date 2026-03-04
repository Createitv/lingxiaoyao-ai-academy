import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { rateLimit } from "@/lib/rate-limit";

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
    return NextResponse.json({ success: false, error: "请求格式错误" }, { status: 400 });
  }

  const { courseSlug } = body as { courseSlug?: string };

  if (!courseSlug || !SAFE_SLUG_RE.test(courseSlug)) {
    return NextResponse.json(
      { success: false, error: "缺少或无效的 courseSlug 参数" },
      { status: 400 },
    );
  }

  const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
  if (!course) {
    return NextResponse.json(
      { success: false, error: "课程不存在" },
      { status: 404 },
    );
  }

  // Free course: use upsert to atomically grant access (防竞态)
  if (course.price === 0) {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: { userId: user.id, courseId: course.id, status: "paid", amount: 0 },
      });
      await tx.userCourse.upsert({
        where: { userId_courseId: { userId: user.id, courseId: course.id } },
        update: {},
        create: { userId: user.id, courseId: course.id, orderId: order.id },
      });
      return order;
    });
    return NextResponse.json({
      success: true,
      data: { orderId: result.id, status: "paid", payUrl: null },
    });
  }

  // Paid course: check again inside transaction to prevent double-orders
  const existing = await prisma.userCourse.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
  });
  if (existing) {
    return NextResponse.json(
      { success: false, error: "已购买该课程" },
      { status: 400 },
    );
  }

  // Validate Alipay credentials before creating order
  const alipayAppId = process.env.ALIPAY_APP_ID;
  const alipayPrivateKey = process.env.ALIPAY_APP_PRIVATE_KEY;
  const alipayPublicKey = process.env.ALIPAY_PUBLIC_KEY;
  if (!alipayAppId || !alipayPrivateKey || !alipayPublicKey) {
    console.error("[Orders] Alipay credentials missing");
    return NextResponse.json(
      { success: false, error: "支付配置异常，请联系客服" },
      { status: 503 },
    );
  }

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      courseId: course.id,
      status: "pending",
      amount: course.price,
    },
  });

  const { AlipaySdk } = await import("alipay-sdk");

  const alipaySdk = new AlipaySdk({
    appId: alipayAppId,
    privateKey: alipayPrivateKey,
    alipayPublicKey: alipayPublicKey,
    gateway:
      process.env.ALIPAY_SANDBOX === "true"
        ? "https://openapi-sandbox.dl.alipaydev.com/gateway.do"
        : "https://openapi.alipay.com/gateway.do",
  });

  const payUrl = alipaySdk.pageExec("alipay.trade.page.pay", {
    method: "GET",
    bizContent: {
      out_trade_no: order.id,
      product_code: "FAST_INSTANT_TRADE_PAY",
      total_amount: (course.price / 100).toFixed(2),
      subject: course.title,
      return_url: process.env.ALIPAY_RETURN_URL,
      notify_url: process.env.ALIPAY_NOTIFY_URL,
    },
  });

  return NextResponse.json({
    success: true,
    data: { orderId: order.id, status: "pending", payUrl },
  });
}
