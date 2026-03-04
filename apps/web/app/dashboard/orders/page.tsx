import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserOrders } from "@/lib/db/orders";

export const metadata: Metadata = {
  title: "我的订单",
  description: "查看购买记录和订单状态",
};

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: {
    label: "待支付",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  paid: {
    label: "已完成",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  failed: {
    label: "失败",
    className:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  refunded: {
    label: "已退款",
    className:
      "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400",
  },
};

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/api/auth/wechat/init?redirect=/dashboard/orders");
  }

  const orders = await getUserOrders(user.id);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← 返回学习中心
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-8">我的订单</h1>

      {orders.length === 0 ? (
        <div className="border rounded-xl p-8 text-center text-muted-foreground">
          <p>暂无订单记录</p>
          <Link
            href="/courses"
            className="mt-4 inline-block text-sm text-primary underline"
          >
            浏览课程
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const config = statusConfig[order.status] ?? statusConfig.pending;
            return (
              <div
                key={order.id}
                className="border rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/courses/${order.course.slug}`}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {order.course.title}
                  </Link>
                  <div className="text-sm text-muted-foreground mt-1 space-x-3">
                    <span>
                      {new Date(order.createdAt).toLocaleDateString("zh-CN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {(order.alipayTradeNo || order.wechatPayTradeNo) && (
                      <span className="text-xs">
                        交易号:{" "}
                        {order.alipayTradeNo ?? order.wechatPayTradeNo}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    订单号: {order.id}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${config.className}`}
                  >
                    {config.label}
                  </span>
                  <span className="font-semibold whitespace-nowrap">
                    ¥{(order.amount / 100).toFixed(0)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
