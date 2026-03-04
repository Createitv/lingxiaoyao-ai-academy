import { cookies } from "next/headers";
import { verifyJWT } from "./jwt";
import { prisma } from "@/lib/db/prisma";
import type { User } from "@workspace/types";

const COOKIE_NAME = "lxy_session";

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
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
      wechatOpenId: user.wechatOpenId,
      wechatUnionId: user.wechatUnionId ?? undefined,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl ?? undefined,
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
