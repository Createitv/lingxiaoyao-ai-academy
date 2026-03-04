import Taro from "@tarojs/taro";
import { request } from "@/utils/request";

interface CreateOrderResult {
  orderId: string;
  status: string;
}

export async function claimFreeCourse(
  courseSlug: string,
): Promise<boolean> {
  const res = await request<CreateOrderResult>({
    url: "/api/orders/create",
    method: "POST",
    data: { courseSlug },
    needAuth: true,
  });

  if (!res.success || !res.data) {
    Taro.showToast({ title: res.error ?? "获取失败", icon: "error" });
    return false;
  }

  if (res.data.status === "paid") {
    Taro.showToast({ title: "获取成功", icon: "success" });
    return true;
  }

  return false;
}
