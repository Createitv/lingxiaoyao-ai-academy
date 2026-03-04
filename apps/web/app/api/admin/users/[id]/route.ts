import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: { orders: true, comments: true, userCourses: true, progress: true },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: user.id,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      role: user.role,
      hasWechat: !!user.wechatOpenId,
      hasMiniProgram: !!user.miniProgramOpenId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      _count: user._count,
    },
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { nickname, role } = body;

  if (role !== undefined && role !== "user" && role !== "admin") {
    return NextResponse.json(
      { success: false, error: "角色值无效，必须是 user 或 admin" },
      { status: 400 },
    );
  }

  // Prevent admin from demoting themselves
  if (id === admin.id && role === "user") {
    return NextResponse.json(
      { success: false, error: "不能将自己降级为普通用户" },
      { status: 400 },
    );
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(nickname !== undefined && { nickname }),
      ...(role !== undefined && { role }),
    },
  });

  return NextResponse.json({
    success: true,
    data: { id: user.id, nickname: user.nickname, role: user.role },
  });
}
