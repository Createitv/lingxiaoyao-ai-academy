import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const params = new URLSearchParams(rawBody);
  const payload = Object.fromEntries(params.entries());

  const orderId = payload["out_trade_no"] as string;
  const alipayTradeNo = payload["trade_no"] as string;
  const tradeStatus = payload["trade_status"] as string;
  const totalAmount = payload["total_amount"] as string;

  // Best-effort audit log (raw payload stored for compliance; no sensitive filtering needed
  // as the log table is internal — but never log to stdout in production)
  if (orderId) {
    prisma.paymentLog.create({
      data: {
        orderId,
        provider: "alipay",
        event: "notify",
        rawPayload: rawBody,
      },
    }).catch((err: unknown) => {
      console.error("[Alipay Webhook] Failed to write payment log:", err instanceof Error ? err.message : "unknown");
    });
  }

  // 1. Validate Alipay credentials are configured
  const alipayAppId = process.env.ALIPAY_APP_ID;
  const alipayPrivateKey = process.env.ALIPAY_APP_PRIVATE_KEY;
  const alipayPublicKey = process.env.ALIPAY_PUBLIC_KEY;
  if (!alipayAppId || !alipayPrivateKey || !alipayPublicKey) {
    console.error("[Alipay Webhook] Alipay credentials not configured");
    return new Response("fail", { status: 500 });
  }

  // 2. Verify RSA2 signature (防伪造)
  const { AlipaySdk } = await import("alipay-sdk");

  const alipaySdk = new AlipaySdk({
    appId: alipayAppId,
    privateKey: alipayPrivateKey,
    alipayPublicKey: alipayPublicKey,
  });

  const isValid = alipaySdk.checkNotifySign(payload);
  if (!isValid) {
    // Log orderId only (not userId or amounts) to avoid leaking sensitive data
    console.error("[Alipay Webhook] Invalid signature for order:", orderId ? orderId.slice(0, 8) + "…" : "unknown");
    return new Response("fail", { status: 400 });
  }

  // 3. Only handle TRADE_SUCCESS and TRADE_FINISHED
  if (tradeStatus !== "TRADE_SUCCESS" && tradeStatus !== "TRADE_FINISHED") {
    return new Response("success");
  }

  // 4. Find order
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { course: { select: { id: true } } },
  });

  if (!order) {
    // Return success to prevent Alipay from retrying indefinitely
    console.warn("[Alipay Webhook] Order not found:", orderId ? orderId.slice(0, 8) + "…" : "unknown");
    return new Response("success");
  }

  // 5. Validate amount (防金额篡改)
  const expectedAmount = (order.amount / 100).toFixed(2);
  if (totalAmount !== expectedAmount) {
    console.error("[Alipay Webhook] Amount mismatch for order (truncated):", orderId.slice(0, 8) + "…");
    return new Response("fail", { status: 400 });
  }

  // 6. Idempotency: skip if already processed
  if (order.status === "paid") {
    return new Response("success");
  }

  // 7. Update order and grant access atomically
  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: "paid", alipayTradeNo },
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

  // Log success without PII (no userId, courseId, amounts in stdout)
  console.log("[Alipay Webhook] Payment processed successfully");

  return new Response("success");
}
