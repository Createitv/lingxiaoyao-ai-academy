import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { rateLimit } from "@/lib/rate-limit";
import type { ContentType } from "@workspace/types";

const VALID_CONTENT_TYPES = ["article", "doc", "chapter"] as const;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const contentType = searchParams.get("type") as ContentType | null;
  const contentSlug = searchParams.get("slug");

  if (!contentType || !VALID_CONTENT_TYPES.includes(contentType) || !contentSlug) {
    return NextResponse.json(
      { success: false, error: "缺少必要参数" },
      { status: 400 },
    );
  }

  const comments = await prisma.comment.findMany({
    where: { contentType, contentSlug, isDeleted: false },
    include: {
      user: { select: { id: true, nickname: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const formatted = comments.map((c) => ({
    id: c.id,
    userId: c.userId,
    user: { nickname: c.user.nickname, avatarUrl: c.user.avatarUrl },
    contentType: c.contentType,
    contentSlug: c.contentSlug,
    parentId: c.parentId ?? undefined,
    body: c.body,
    createdAt: c.createdAt,
    isDeleted: c.isDeleted,
  }));

  return NextResponse.json({ success: true, data: formatted });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: "请先登录后再发表评论" },
      { status: 401 },
    );
  }

  if (
    !rateLimit(`comment:${user.id}`, { maxRequests: 10, windowMs: 60_000 })
  ) {
    return NextResponse.json(
      { success: false, error: "评论过于频繁，请稍后再试" },
      { status: 429 },
    );
  }

  const body = await request.json();
  const {
    contentType,
    contentSlug,
    body: commentBody,
    parentId,
  } = body as {
    contentType: string;
    contentSlug: string;
    body: string;
    parentId?: string;
  };

  if (!VALID_CONTENT_TYPES.includes(contentType as ContentType)) {
    return NextResponse.json(
      { success: false, error: "无效的内容类型" },
      { status: 400 },
    );
  }

  if (!contentSlug || !commentBody?.trim()) {
    return NextResponse.json(
      { success: false, error: "评论内容不能为空" },
      { status: 400 },
    );
  }

  if (commentBody.length > 2000) {
    return NextResponse.json(
      { success: false, error: "评论内容过长（最多2000字）" },
      { status: 400 },
    );
  }

  const comment = await prisma.comment.create({
    data: {
      userId: user.id,
      contentType: contentType as ContentType,
      contentSlug,
      parentId: parentId ?? null,
      body: commentBody.trim(),
    },
    include: {
      user: { select: { nickname: true, avatarUrl: true } },
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      id: comment.id,
      userId: comment.userId,
      user: { nickname: comment.user.nickname, avatarUrl: comment.user.avatarUrl },
      contentType: comment.contentType,
      contentSlug: comment.contentSlug,
      parentId: comment.parentId ?? undefined,
      body: comment.body,
      createdAt: comment.createdAt,
      isDeleted: false,
    },
  });
}
