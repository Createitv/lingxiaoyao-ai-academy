import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { UserForm } from "@/components/admin/user-form";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: { orders: true, comments: true, userCourses: true, progress: true },
      },
    },
  });
  if (!user) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">编辑用户</h1>
      <UserForm
        initial={{
          id: user.id,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl ?? "",
          role: user.role as "user" | "admin",
          hasWechat: !!user.wechatOpenId,
          hasMiniProgram: !!user.miniProgramOpenId,
          createdAt: user.createdAt.toISOString(),
          stats: user._count,
        }}
      />
    </div>
  );
}
