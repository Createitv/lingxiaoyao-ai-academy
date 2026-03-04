import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { signJWT } from "@/lib/auth/jwt";
import { getSessionCookieOptions } from "@/lib/auth/session";

// Only allow redirecting to same-origin relative paths (防 Open Redirect)
function sanitizeRedirectPath(raw: string | null): string {
  if (!raw) return "/";
  try {
    const decoded = decodeURIComponent(raw);
    // Must be a relative path starting with /
    if (!decoded.startsWith("/") || decoded.startsWith("//")) return "/";
    // Reject any path that includes a protocol scheme
    if (/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(decoded)) return "/";
    return decoded;
  } catch {
    return "/";
  }
}

const WECHAT_TIMEOUT_MS = 8_000;

interface WechatTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  openid: string;
  scope: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

interface WechatUserInfo {
  openid: string;
  nickname: string;
  headimgurl: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

async function getWechatToken(code: string): Promise<WechatTokenResponse> {
  const appId = process.env.WECHAT_APP_ID;
  const appSecret = process.env.WECHAT_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error("WeChat credentials are not configured");
  }

  const url =
    `https://api.weixin.qq.com/sns/oauth2/access_token` +
    `?appid=${encodeURIComponent(appId)}` +
    `&secret=${encodeURIComponent(appSecret)}` +
    `&code=${encodeURIComponent(code)}` +
    `&grant_type=authorization_code`;

  const res = await fetch(url, {
    signal: AbortSignal.timeout(WECHAT_TIMEOUT_MS),
  });

  if (!res.ok) {
    throw new Error(`WeChat token request failed: ${res.status}`);
  }

  const data = await res.json();
  return data as WechatTokenResponse;
}

async function getWechatUserInfo(
  accessToken: string,
  openid: string,
): Promise<WechatUserInfo> {
  const url =
    `https://api.weixin.qq.com/sns/userinfo` +
    `?access_token=${encodeURIComponent(accessToken)}` +
    `&openid=${encodeURIComponent(openid)}` +
    `&lang=zh_CN`;

  const res = await fetch(url, {
    signal: AbortSignal.timeout(WECHAT_TIMEOUT_MS),
  });

  if (!res.ok) {
    throw new Error(`WeChat userinfo request failed: ${res.status}`);
  }

  const data = await res.json();
  return data as WechatUserInfo;
}

// Handles both Web callback (returns redirect) and Desktop callback (returns JSON).
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const isDesktop = searchParams.get("platform") === "desktop";

  if (!code) {
    return NextResponse.json(
      { success: false, error: "Missing code parameter" },
      { status: 400 },
    );
  }

  try {
    // 1. Exchange code for access_token
    const tokenData = await getWechatToken(code);
    if (tokenData.errcode) {
      return NextResponse.json(
        { success: false, error: "微信授权失败，请重试" },
        { status: 400 },
      );
    }

    // 2. Get user info
    const userInfo = await getWechatUserInfo(
      tokenData.access_token,
      tokenData.openid,
    );
    if (userInfo.errcode) {
      return NextResponse.json(
        { success: false, error: "获取用户信息失败，请重试" },
        { status: 400 },
      );
    }

    // 3. Upsert user in database
    const user = await prisma.user.upsert({
      where: { wechatOpenId: tokenData.openid },
      update: {
        nickname: userInfo.nickname,
        avatarUrl: userInfo.headimgurl,
        wechatUnionId: userInfo.unionid,
      },
      create: {
        wechatOpenId: tokenData.openid,
        wechatUnionId: userInfo.unionid,
        nickname: userInfo.nickname,
        avatarUrl: userInfo.headimgurl,
      },
    });

    // 4. Sign JWT
    const token = signJWT({ userId: user.id, nickname: user.nickname });
    const cookieOptions = getSessionCookieOptions();

    if (isDesktop) {
      // Tauri desktop: return JWT (stored securely by the app, not in cookie)
      return NextResponse.json({
        success: true,
        data: {
          token,
          user: { id: user.id, nickname: user.nickname, avatarUrl: user.avatarUrl },
        },
      });
    }

    // Web: set httpOnly cookie and redirect to sanitized path (防 Open Redirect)
    const redirectTo = sanitizeRedirectPath(state);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const response = NextResponse.redirect(new URL(redirectTo, siteUrl));
    response.cookies.set({ ...cookieOptions, value: token });
    return response;
  } catch (err) {
    console.error("[WeChat Callback] Error:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json(
      { success: false, error: "登录失败，请稍后重试" },
      { status: 500 },
    );
  }
}
