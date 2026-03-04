import Taro from "@tarojs/taro";
import { request } from "@/utils/request";

interface CreateOrderResult {
  orderId: string;
  status: string;
  payment?: {
    timeStamp: string;
    nonceStr: string;
    package: string;
    signType: string;
    paySign: string;
  };
}

interface OrderStatus {
  id: string;
  status: string;
}

export async function createOrder(
  courseSlug: string,
): Promise<CreateOrderResult | null> {
  const res = await request<CreateOrderResult>({
    url: "/api/orders/create-wechat",
    method: "POST",
    data: { courseSlug },
    needAuth: true,
  });

  return res.data ?? null;
}

export async function payForCourse(courseSlug: string): Promise<boolean> {
  const orderResult = await createOrder(courseSlug);
  if (!orderResult) {
    Taro.showToast({ title: "创建订单失败", icon: "error" });
    return false;
  }

  // Free course: already paid
  if (orderResult.status === "paid") {
    Taro.showToast({ title: "获取成功", icon: "success" });
    return true;
  }

  // Paid course: invoke WeChat Pay
  if (!orderResult.payment) {
    Taro.showToast({ title: "支付参数异常", icon: "error" });
    return false;
  }

  try {
    await Taro.requestPayment({
      timeStamp: orderResult.payment.timeStamp,
      nonceStr: orderResult.payment.nonceStr,
      package: orderResult.payment.package,
      signType: orderResult.payment.signType as "RSA",
      paySign: orderResult.payment.paySign,
    });

    // Poll order status to confirm
    const paid = await pollOrderStatus(orderResult.orderId);
    if (paid) {
      Taro.showToast({ title: "支付成功", icon: "success" });
      return true;
    }

    Taro.showToast({ title: "支付确认中，请稍后查看", icon: "none" });
    return false;
  } catch (err: unknown) {
    const error = err as { errMsg?: string };
    if (error.errMsg?.includes("cancel")) {
      Taro.showToast({ title: "已取消支付", icon: "none" });
    } else {
      Taro.showToast({ title: "支付失败", icon: "error" });
    }
    return false;
  }
}

async function pollOrderStatus(orderId: string): Promise<boolean> {
  for (let i = 0; i < 5; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const res = await request<OrderStatus>({
      url: `/api/orders/${orderId}`,
      needAuth: true,
    });

    if (res.data?.status === "paid") return true;
  }
  return false;
}
