import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import type { ContentType } from "@workspace/types";

const VALID_CONTENT_TYPES = ["article", "chapter"] as const;

export async function GET(_request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: "请先登录" },
      { status: 401 },
    );
  }

  const records = await prisma.userProgress.findMany({
    where: { userId: user.id },
    orderBy: { completedAt: "desc" },
  });

  return NextResponse.json({ success: true, data: records });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: "请先登录" },
      { status: 401 },
    );
  }

  const body = await request.json();
  const { contentType, contentSlug } = body as {
    contentType: string;
    contentSlug: string;
  };

  if (!VALID_CONTENT_TYPES.includes(contentType as ContentType) || !contentSlug) {
    return NextResponse.json(
      { success: false, error: "无效参数" },
      { status: 400 },
    );
  }

  const record = await prisma.userProgress.upsert({
    where: {
      userId_contentType_contentSlug: {
        userId: user.id,
        contentType: contentType as ContentType,
        contentSlug,
      },
    },
    update: { completedAt: new Date() },
    create: {
      userId: user.id,
      contentType: contentType as ContentType,
      contentSlug,
    },
  });

  return NextResponse.json({ success: true, data: record });
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: "请先登录" },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const contentType = searchParams.get("type") as ContentType | null;
  const contentSlug = searchParams.get("slug");

  if (!contentType || !contentSlug) {
    return NextResponse.json(
      { success: false, error: "缺少参数" },
      { status: 400 },
    );
  }

  await prisma.userProgress.deleteMany({
    where: {
      userId: user.id,
      contentType,
      contentSlug,
    },
  });

  return NextResponse.json({ success: true });
}
