"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";

type OrderStatus = "pending" | "paid" | "failed" | "refunded";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderIdFromUrl = searchParams.get("orderId");

  const [orderId, setOrderId] = useState<string | null>(null);
  const [status, setStatus] = useState<OrderStatus>("pending");
  const [courseSlug, setCourseSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id =
      orderIdFromUrl ?? sessionStorage.getItem("lxy_pending_order");
    if (id) {
      setOrderId(id);
      sessionStorage.removeItem("lxy_pending_order");
    }
  }, [orderIdFromUrl]);

  const pollOrder = useCallback(async () => {
    if (!orderId) return;

    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();

      if (data.success) {
        setStatus(data.data.status);
        if (data.data.course?.slug) {
          setCourseSlug(data.data.course.slug);
        }
        return data.data.status;
      }
      return null;
    } catch {
      return null;
    }
  }, [orderId]);

  // Poll order status
  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes max

    async function poll() {
      if (cancelled) return;
      const currentStatus = await pollOrder();

      if (currentStatus === "paid" || currentStatus === "failed" || currentStatus === "refunded") {
        return; // Terminal state
      }

      attempts++;
      if (attempts >= maxAttempts) {
        setError("查询超时，请稍后在学习中心查看订单状态。");
        return;
      }

      setTimeout(poll, 10_000); // Poll every 10 seconds
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [orderId, pollOrder]);

  if (!orderId) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">未找到订单</h1>
        <p className="text-muted-foreground mb-6">请从课程页面重新购买。</p>
        <Button asChild>
          <Link href="/courses">浏览课程</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-24 text-center">
      {status === "pending" && (
        <>
          <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <svg
              className="h-8 w-8 text-muted-foreground animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">等待支付确认...</h1>
          <p className="text-muted-foreground">
            正在确认支付结果，请稍候。
            <br />
            如果已完成支付，通常几秒内即可确认。
          </p>
          {error && (
            <p className="mt-4 text-sm text-destructive">{error}</p>
          )}
        </>
      )}

      {status === "paid" && (
        <>
          <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <svg
              className="h-8 w-8 text-green-600 dark:text-green-400"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3354 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.5553 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">支付成功!</h1>
          <p className="text-muted-foreground mb-8">
            课程已解锁，现在可以开始学习了。
          </p>
          <div className="flex gap-4 justify-center">
            {courseSlug && (
              <Button asChild size="lg">
                <Link href={`/courses/${courseSlug}`}>开始学习</Link>
              </Button>
            )}
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard">学习中心</Link>
            </Button>
          </div>
        </>
      )}

      {(status === "failed" || status === "refunded") && (
        <>
          <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <svg
              className="h-8 w-8 text-destructive"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">
            {status === "failed" ? "支付失败" : "订单已退款"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {status === "failed"
              ? "支付未成功，请重新尝试。"
              : "该订单已退款。"}
          </p>
          <Button asChild>
            <Link href="/courses">返回课程</Link>
          </Button>
        </>
      )}
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="text-muted-foreground">加载中...</div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
