"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";

interface CourseInfo {
  slug: string;
  title: string;
  price: number;
  totalChapters: number;
}

function PaymentConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseSlug = searchParams.get("courseSlug");

  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseSlug) {
      setLoading(false);
      return;
    }

    fetch(`/api/courses/${courseSlug}/info`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCourse(data.data);
        } else {
          setError(data.error ?? "课程不存在");
        }
      })
      .catch(() => setError("加载课程信息失败"))
      .finally(() => setLoading(false));
  }, [courseSlug]);

  async function handlePay() {
    if (!courseSlug || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug }),
      });
      const data = await res.json();

      if (!data.success) {
        if (res.status === 401) {
          router.push("/api/auth/wechat/init");
          return;
        }
        setError(data.error ?? "创建订单失败");
        return;
      }

      const { orderId, payUrl } = data.data;

      if (payUrl) {
        sessionStorage.setItem("lxy_pending_order", orderId);
        window.location.href = payUrl;
      } else {
        // 免费课程：订单已直接完成，跳转到课程页
        router.push(`/courses/${courseSlug}`);
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  if (!courseSlug || !course) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">课程不存在</h1>
        <p className="text-muted-foreground mb-6">
          {error ?? "请从课程页面进入购买流程。"}
        </p>
        <Button asChild>
          <Link href="/courses">浏览课程</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-16">
      <h1 className="text-2xl font-bold mb-8">确认订单</h1>

      <div className="rounded-xl border p-6 space-y-6">
        <div>
          <h2 className="font-semibold text-lg">{course.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {course.totalChapters} 节视频课程 · 永久有效
          </p>
        </div>

        <div className="border-t" />

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">课程价格</span>
          <span className="text-2xl font-bold">
            ¥{(course.price / 100).toFixed(0)}
          </span>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-3">支付方式</p>
          <div className="flex items-center gap-3 rounded-lg border p-3 bg-muted/30">
            <div className="h-8 w-8 rounded bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
              支
            </div>
            <span className="text-sm font-medium">支付宝</span>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          className="w-full"
          size="lg"
          onClick={handlePay}
          disabled={submitting}
        >
          {submitting
            ? "正在创建订单..."
            : `支付 ¥${(course.price / 100).toFixed(0)}`}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          点击支付即表示同意{" "}
          <Link href="/about" className="underline hover:text-foreground">
            服务条款
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function PaymentConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="text-muted-foreground">加载中...</div>
        </div>
      }
    >
      <PaymentConfirmContent />
    </Suspense>
  );
}
