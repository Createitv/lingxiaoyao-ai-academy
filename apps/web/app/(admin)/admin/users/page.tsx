import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

export default async function AdminUsersPage(): Promise<React.JSX.Element> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      nickname: true,
      avatarUrl: true,
      role: true,
      wechatOpenId: true,
      miniProgramOpenId: true,
      createdAt: true,
      _count: { select: { orders: true, userCourses: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">用户管理</h1>
        <p className="text-sm text-muted-foreground">共 {users.length} 位用户</p>
      </div>

      <div className="rounded-lg border bg-card">
        {users.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">暂无用户</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="px-6 py-3 font-medium">用户</th>
                <th className="px-6 py-3 font-medium">角色</th>
                <th className="px-6 py-3 font-medium">登录方式</th>
                <th className="px-6 py-3 font-medium">已购课程</th>
                <th className="px-6 py-3 font-medium">注册时间</th>
                <th className="px-6 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-accent/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt=""
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                          {user.nickname.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium">{user.nickname}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {user.role === "admin" ? "管理员" : "普通用户"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {user.wechatOpenId && (
                        <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          微信
                        </span>
                      )}
                      {user.miniProgramOpenId && (
                        <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          小程序
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {user._count.userCourses}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {user.createdAt.toLocaleDateString("zh-CN")}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/users/${user.id}/edit`}
                      className="text-sm text-primary hover:underline"
                    >
                      编辑
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
