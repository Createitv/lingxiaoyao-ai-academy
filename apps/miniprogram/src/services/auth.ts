import Taro from "@tarojs/taro";
import { request, setToken, getToken, removeToken } from "@/utils/request";

interface LoginResult {
  token: string;
  user: {
    id: string;
    nickname: string;
    avatarUrl?: string;
  };
}

const USER_KEY = "lxy_user";

export function getUser(): LoginResult["user"] | null {
  const raw = Taro.getStorageSync(USER_KEY);
  return raw ? (JSON.parse(raw) as LoginResult["user"]) : null;
}

function saveUser(user: LoginResult["user"]): void {
  Taro.setStorageSync(USER_KEY, JSON.stringify(user));
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export async function login(): Promise<LoginResult["user"] | null> {
  // Already logged in
  const existing = getUser();
  if (existing && getToken()) return existing;

  try {
    const loginRes = await Taro.login();
    if (!loginRes.code) {
      console.error("[Auth] wx.login failed");
      return null;
    }

    const res = await request<LoginResult>({
      url: "/api/auth/miniprogram/login",
      method: "POST",
      data: { code: loginRes.code },
    });

    if (!res.success || !res.data) {
      console.error("[Auth] Server login failed:", res.error);
      return null;
    }

    setToken(res.data.token);
    saveUser(res.data.user);
    return res.data.user;
  } catch (err) {
    console.error("[Auth] Login error:", err);
    return null;
  }
}

export function logout(): void {
  removeToken();
  Taro.removeStorageSync(USER_KEY);
}

export async function updateProfile(
  nickname: string,
  avatarUrl: string,
): Promise<boolean> {
  // Re-login with updated profile info
  try {
    const loginRes = await Taro.login();
    if (!loginRes.code) return false;

    const res = await request<LoginResult>({
      url: "/api/auth/miniprogram/login",
      method: "POST",
      data: { code: loginRes.code, nickname, avatarUrl },
    });

    if (res.success && res.data) {
      setToken(res.data.token);
      saveUser(res.data.user);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
