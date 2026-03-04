import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: "请先登录" },
      { status: 401 },
    );
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { course: { select: { slug: true, title: true } } },
  });

  if (!order) {
    return NextResponse.json(
      { success: false, error: "订单不存在" },
      { status: 404 },
    );
  }

  // Users can only see their own orders
  if (order.userId !== user.id) {
    return NextResponse.json(
      { success: false, error: "无权访问该订单" },
      { status: 403 },
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      id: order.id,
      status: order.status,
      amount: order.amount,
      course: order.course,
      createdAt: order.createdAt,
    },
  });
}
