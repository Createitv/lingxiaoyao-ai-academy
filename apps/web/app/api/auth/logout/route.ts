import { NextResponse } from "next/server";
import { getSessionCookieOptions } from "@/lib/auth/session";

export async function POST() {
  const response = NextResponse.json({ success: true });
  const { name } = getSessionCookieOptions();
  response.cookies.delete(name);
  return response;
}
