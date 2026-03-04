import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: "请先登录" },
      { status: 401 },
    );
  }

  const { id } = await params;
  const comment = await prisma.comment.findUnique({ where: { id } });

  if (!comment) {
    return NextResponse.json(
      { success: false, error: "评论不存在" },
      { status: 404 },
    );
  }

  if (comment.userId !== user.id) {
    return NextResponse.json(
      { success: false, error: "无权删除该评论" },
      { status: 403 },
    );
  }

  // Soft delete
  await prisma.comment.update({
    where: { id },
    data: { isDeleted: true },
  });

  return NextResponse.json({ success: true });
}
