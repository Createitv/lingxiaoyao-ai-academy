import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, parseInt(searchParams.get("pageSize") ?? "20"));
  const search = searchParams.get("search") ?? "";
  const role = searchParams.get("role") ?? "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.nickname = { contains: search, mode: "insensitive" };
  }
  if (role === "admin" || role === "user") {
    where.role = role;
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        nickname: true,
        avatarUrl: true,
        role: true,
        wechatOpenId: true,
        miniProgramOpenId: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { orders: true, userCourses: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  // Mask sensitive auth IDs
  const maskedItems = items.map(({ wechatOpenId, miniProgramOpenId, ...rest }) => ({
    ...rest,
    hasWechat: !!wechatOpenId,
    hasMiniProgram: !!miniProgramOpenId,
  }));

  return NextResponse.json({
    success: true,
    data: { items: maskedItems, total, page, pageSize, hasMore: page * pageSize < total },
  });
}
