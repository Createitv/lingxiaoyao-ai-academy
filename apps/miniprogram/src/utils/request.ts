import Taro from "@tarojs/taro";
import type { ApiResponse } from "@workspace/types";

// TODO: Change to your production API URL
const BASE_URL = "https://lingxiaoyao.cn";

const TOKEN_KEY = "lxy_token";

export function getToken(): string | null {
  return Taro.getStorageSync(TOKEN_KEY) || null;
}

export function setToken(token: string): void {
  Taro.setStorageSync(TOKEN_KEY, token);
}

export function removeToken(): void {
  Taro.removeStorageSync(TOKEN_KEY);
}

interface RequestOptions {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: Record<string, unknown>;
  header?: Record<string, string>;
  needAuth?: boolean;
}

export async function request<T = unknown>(
  options: RequestOptions,
): Promise<ApiResponse<T>> {
  const { url, method = "GET", data, header = {}, needAuth = false } = options;

  const token = getToken();

  if (needAuth && !token) {
    Taro.navigateTo({ url: "/pages/profile/index" });
    return { success: false, error: "请先登录" };
  }

  if (token) {
    header["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await Taro.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        "Content-Type": "application/json",
        ...header,
      },
    });

    if (res.statusCode === 401) {
      removeToken();
      return { success: false, error: "登录已过期，请重新登录" };
    }

    return res.data as ApiResponse<T>;
  } catch (err) {
    console.error("[Request] Failed:", err);
    return { success: false, error: "网络请求失败" };
  }
}
