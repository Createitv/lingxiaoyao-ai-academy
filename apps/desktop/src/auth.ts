/**
 * Desktop auth module - handles WeChat OAuth via system browser + deep link.
 * Stores JWT in Tauri's secure keyring.
 */

import { open } from "@tauri-apps/plugin-shell";
import { listen } from "@tauri-apps/api/event";

const API_BASE = "https://lingxiaoyao.cn";

const TOKEN_KEY = "lxy_jwt";

// Simple in-memory token storage (for desktop, use keyring in production)
let _token: string | null = null;

export async function getStoredToken(): Promise<string | null> {
  // TODO: replace with tauri-plugin-keyring for production
  return _token ?? localStorage.getItem(TOKEN_KEY);
}

export async function storeToken(token: string): Promise<void> {
  _token = token;
  // TODO: replace with tauri-plugin-keyring for production
  localStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  _token = null;
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Initiates WeChat OAuth flow for desktop:
 * 1. Fetches auth URL from backend
 * 2. Opens system browser
 * 3. Listens for deep link callback (lingxiaoyao://auth?code=xxx)
 * 4. Exchanges code for JWT
 */
export async function initiateWechatLogin(): Promise<{
  token: string;
  user: unknown;
} | null> {
  // 1. Get auth URL from backend
  const res = await fetch(`${API_BASE}/api/auth/wechat/init`, {
    method: "POST",
  });
  const data = await res.json();

  if (!data.success || !data.data?.authUrl) {
    throw new Error("获取微信授权链接失败");
  }

  // 2. Open system browser
  await open(data.data.authUrl);

  // 3. Wait for deep link callback
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      unlisten();
      reject(new Error("登录超时，请重试"));
    }, 5 * 60 * 1000); // 5 minutes timeout

    let unlisten: () => void;

    listen<string>("wechat-auth-code", async (event) => {
      clearTimeout(timeout);
      unlisten();

      const code = event.payload;

      try {
        // 4. Exchange code for JWT
        const callbackRes = await fetch(
          `${API_BASE}/api/auth/wechat/callback?code=${encodeURIComponent(code)}&platform=desktop`,
        );
        const callbackData = await callbackRes.json();

        if (!callbackData.success) {
          reject(new Error(callbackData.error ?? "登录失败"));
          return;
        }

        await storeToken(callbackData.data.token);
        resolve(callbackData.data);
      } catch (err) {
        reject(err);
      }
    }).then((fn) => {
      unlisten = fn;
    });
  });
}
