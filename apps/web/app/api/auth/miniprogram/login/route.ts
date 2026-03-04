import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { signJWT } from "@/lib/auth/jwt";
import { rateLimit } from "@/lib/rate-limit";

const WECHAT_TIMEOUT_MS = 8_000;

interface Code2SessionResponse {
  openid: string;
  session_key: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

async function code2Session(code: string): Promise<Code2SessionResponse> {
  const appId = process.env.MINI_PROGRAM_APP_ID;
  const appSecret = process.env.MINI_PROGRAM_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error("Mini program credentials are not configured");
  }

  const url =
    `https://api.weixin.qq.com/sns/jscode2session` +
    `?appid=${encodeURIComponent(appId)}` +
    `&secret=${encodeURIComponent(appSecret)}` +
    `&js_code=${encodeURIComponent(code)}` +
    `&grant_type=authorization_code`;

  const res = await fetch(url, {
    signal: AbortSignal.timeout(WECHAT_TIMEOUT_MS),
  });

  if (!res.ok) {
    throw new Error(`WeChat code2Session request failed: ${res.status}`);
  }

  return (await res.json()) as Code2SessionResponse;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`mp-login:${ip}`, { maxRequests: 10, windowMs: 60_000 })) {
    return NextResponse.json(
      { success: false, error: "操作过于频繁，请稍后再试" },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "请求格式错误" },
      { status: 400 },
    );
  }

  const { code, nickname, avatarUrl } = body as {
    code?: string;
    nickname?: string;
    avatarUrl?: string;
  };

  if (!code) {
    return NextResponse.json(
      { success: false, error: "缺少 code 参数" },
      { status: 400 },
    );
  }

  try {
    const sessionData = await code2Session(code);

    if (sessionData.errcode) {
      console.error("[MiniProgram Login] code2Session error:", sessionData.errcode, sessionData.errmsg);
      return NextResponse.json(
        { success: false, error: "微信登录失败，请重试" },
        { status: 400 },
      );
    }

    // Try to find existing user by unionId first (link with web account),
    // then by miniProgramOpenId
    let user = null;

    if (sessionData.unionid) {
      user = await prisma.user.findUnique({
        where: { wechatUnionId: sessionData.unionid },
      });
    }

    if (!user) {
      user = await prisma.user.findUnique({
        where: { miniProgramOpenId: sessionData.openid },
      });
    }

    if (user) {
      // Update existing user with mini program openid and optional profile info
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          miniProgramOpenId: sessionData.openid,
          wechatUnionId: sessionData.unionid ?? user.wechatUnionId,
          ...(nickname && { nickname }),
          ...(avatarUrl && { avatarUrl }),
        },
      });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          miniProgramOpenId: sessionData.openid,
          wechatUnionId: sessionData.unionid,
          nickname: nickname ?? "微信用户",
          avatarUrl: avatarUrl,
        },
      });
    }

    const token = signJWT({ userId: user.id, nickname: user.nickname });

    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
        },
      },
    });
  } catch (err) {
    console.error("[MiniProgram Login] Error:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json(
      { success: false, error: "登录失败，请稍后重试" },
      { status: 500 },
    );
  }
}
