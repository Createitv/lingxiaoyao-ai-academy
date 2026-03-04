import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth/jwt";
import { getSessionCookieOptions } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const token = searchParams.get("token");
  const redirect = searchParams.get("redirect");

  if (!token) {
    return NextResponse.json(
      { success: false, error: "缺少 token 参数" },
      { status: 400 },
    );
  }

  const payload = verifyJWT(token);
  if (!payload) {
    return NextResponse.json(
      { success: false, error: "token 无效或已过期" },
      { status: 401 },
    );
  }

  // Validate redirect is a safe relative path (prevent open redirect)
  let targetPath = "/";
  if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
    targetPath = redirect;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const response = NextResponse.redirect(new URL(targetPath, siteUrl));

  const cookieOptions = getSessionCookieOptions();
  response.cookies.set(cookieOptions.name, token, {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: cookieOptions.path,
    maxAge: cookieOptions.maxAge,
  });

  return response;
}
