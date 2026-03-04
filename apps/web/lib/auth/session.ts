import { cookies, headers } from "next/headers";
import { verifyJWT } from "./jwt";
import { prisma } from "@/lib/db/prisma";
import type { User } from "@workspace/types";

const COOKIE_NAME = "lxy_session";

export async function getCurrentUser(): Promise<User | null> {
  // Try Bearer token first (mini program / desktop), then fall back to cookie (web)
  let token: string | undefined;

  const headerStore = await headers();
  const authHeader = headerStore.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  }

  if (!token) {
    const cookieStore = await cookies();
    token = cookieStore.get(COOKIE_NAME)?.value;
  }

  if (!token) return null;

  const payload = verifyJWT(token);
  if (!payload) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) return null;

    return {
      id: user.id,
      wechatOpenId: user.wechatOpenId ?? undefined,
      wechatUnionId: user.wechatUnionId ?? undefined,
      miniProgramOpenId: user.miniProgramOpenId ?? undefined,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl ?? undefined,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } catch (err) {
    console.error("[Session] DB lookup failed:", err instanceof Error ? err.message : "unknown");
    return null;
  }
}

export function getSessionCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
}
