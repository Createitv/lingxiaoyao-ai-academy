import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

// Generates the WeChat OAuth authorization URL and redirects user to it.
// 使用开放平台扫码登录（qrconnect）
export async function GET(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!rateLimit(`wechat-init:${ip}`, { maxRequests: 10, windowMs: 60_000 })) {
    return NextResponse.json(
      { success: false, error: "请求过于频繁，请稍后再试" },
      { status: 429 },
    );
  }

  const { searchParams } = new URL(request.url);
  const redirect = searchParams.get("redirect") ?? "/";

  const appId = process.env.WECHAT_APP_ID!;
  const redirectUri = encodeURIComponent(
    process.env.WECHAT_REDIRECT_URI ?? "",
  );
  const state = encodeURIComponent(redirect);

  const authUrl =
    `https://open.weixin.qq.com/connect/qrconnect` +
    `?appid=${appId}` +
    `&redirect_uri=${redirectUri}` +
    `&response_type=code` +
    `&scope=snsapi_login` +
    `&state=${state}` +
    `#wechat_redirect`;

  return NextResponse.redirect(authUrl);
}

// For desktop (Tauri): return JSON with authUrl instead of redirect.
// 桌面端始终使用扫码登录
export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!rateLimit(`wechat-init:${ip}`, { maxRequests: 10, windowMs: 60_000 })) {
    return NextResponse.json(
      { success: false, error: "请求过于频繁，请稍后再试" },
      { status: 429 },
    );
  }

  const appId = process.env.WECHAT_APP_ID!;
  const redirectUri = encodeURIComponent(
    process.env.WECHAT_DESKTOP_REDIRECT_URI ?? "lingxiaoyao://auth",
  );
  const state = encodeURIComponent(
    JSON.stringify({ platform: "desktop", ts: Date.now() }),
  );

  const authUrl =
    `https://open.weixin.qq.com/connect/qrconnect` +
    `?appid=${appId}` +
    `&redirect_uri=${redirectUri}` +
    `&response_type=code` +
    `&scope=snsapi_login` +
    `&state=${state}` +
    `#wechat_redirect`;

  return NextResponse.json({ success: true, data: { authUrl } });
}
