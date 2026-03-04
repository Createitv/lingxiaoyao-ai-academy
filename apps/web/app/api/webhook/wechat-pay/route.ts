import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  getWechatPayConfig,
  decryptResource,
} from "@/lib/wechat-pay/sdk";

interface WechatPayNotification {
  id: string;
  create_time: string;
  resource_type: string;
  event_type: string;
  resource: {
    algorithm: string;
    ciphertext: string;
    nonce: string;
    associated_data: string;
    original_type: string;
  };
}

interface PaymentResult {
  appid: string;
  mchid: string;
  out_trade_no: string;
  transaction_id: string;
  trade_type: string;
  trade_state: string;
  trade_state_desc: string;
  amount: {
    total: number;
    payer_total: number;
    currency: string;
  };
  payer: {
    openid: string;
  };
  success_time: string;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  // Parse notification
  let notification: WechatPayNotification;
  try {
    notification = JSON.parse(rawBody) as WechatPayNotification;
  } catch {
    return new Response(
      JSON.stringify({ code: "FAIL", message: "Invalid request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Get config
  const config = getWechatPayConfig();
  if (!config) {
    console.error("[WeChat Pay Webhook] Credentials not configured");
    return new Response(
      JSON.stringify({ code: "FAIL", message: "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  // Decrypt the resource to get payment result
  let paymentResult: PaymentResult;
  try {
    const decrypted = decryptResource(
      notification.resource.ciphertext,
      notification.resource.nonce,
      notification.resource.associated_data,
      config.apiV3Key,
    );
    paymentResult = JSON.parse(decrypted) as PaymentResult;
  } catch (err) {
    console.error("[WeChat Pay Webhook] Decrypt failed:", err instanceof Error ? err.message : "unknown");
    return new Response(
      JSON.stringify({ code: "FAIL", message: "Decrypt failed" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const orderId = paymentResult.out_trade_no;
  const transactionId = paymentResult.transaction_id;

  // Audit log
  if (orderId) {
    prisma.paymentLog
      .create({
        data: {
          orderId,
          provider: "wechat_pay",
          event: notification.event_type,
          rawPayload: rawBody,
        },
      })
      .catch((err: unknown) => {
        console.error(
          "[WeChat Pay Webhook] Failed to write payment log:",
          err instanceof Error ? err.message : "unknown",
        );
      });
  }

  // Only process successful payments
  if (paymentResult.trade_state !== "SUCCESS") {
    return new Response(
      JSON.stringify({ code: "SUCCESS", message: "OK" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  // Find order
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    console.warn("[WeChat Pay Webhook] Order not found:", orderId?.slice(0, 8) + "…");
    return new Response(
      JSON.stringify({ code: "SUCCESS", message: "OK" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  // Validate amount (防金额篡改)
  if (paymentResult.amount.total !== order.amount) {
    console.error("[WeChat Pay Webhook] Amount mismatch for order:", orderId.slice(0, 8) + "…");
    return new Response(
      JSON.stringify({ code: "FAIL", message: "Amount mismatch" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Idempotency: skip if already processed
  if (order.status === "paid") {
    return new Response(
      JSON.stringify({ code: "SUCCESS", message: "OK" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  // Update order and grant access atomically
  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: "paid", wechatPayTradeNo: transactionId },
    });

    await tx.userCourse.upsert({
      where: {
        userId_courseId: { userId: order.userId, courseId: order.courseId },
      },
      update: {},
      create: {
        userId: order.userId,
        courseId: order.courseId,
        orderId: order.id,
      },
    });
  });

  console.log("[WeChat Pay Webhook] Payment processed successfully");

  return new Response(
    JSON.stringify({ code: "SUCCESS", message: "OK" }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}
