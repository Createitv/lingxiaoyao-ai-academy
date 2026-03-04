import { prisma } from "./prisma";

export interface UserOrder {
  id: string;
  status: string;
  amount: number;
  alipayTradeNo: string | null;
  wechatPayTradeNo: string | null;
  createdAt: Date;
  course: {
    slug: string;
    title: string;
    coverUrl: string | null;
  };
}

export async function getUserOrders(userId: string): Promise<UserOrder[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      course: {
        select: { slug: true, title: true, coverUrl: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return orders.map((o) => ({
    id: o.id,
    status: o.status,
    amount: o.amount,
    alipayTradeNo: o.alipayTradeNo,
    wechatPayTradeNo: o.wechatPayTradeNo,
    createdAt: o.createdAt,
    course: {
      slug: o.course.slug,
      title: o.course.title,
      coverUrl: o.course.coverUrl,
    },
  }));
}
