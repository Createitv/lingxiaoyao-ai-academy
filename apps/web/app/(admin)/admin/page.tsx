import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

export default async function AdminDashboard(): Promise<React.JSX.Element> {
  const [articleCount, courseCount, userCount] = await Promise.all([
    prisma.article.count(),
    prisma.course.count(),
    prisma.user.count(),
  ]);

  const stats = [
    { label: "文章", count: articleCount, href: "/admin/articles" },
    { label: "课程", count: courseCount, href: "/admin/courses" },
    { label: "用户", count: userCount, href: "/admin/users" },
  ];

  const recentArticles = await prisma.article.findMany({
    orderBy: { updatedAt: "desc" },
    take: 5,
    select: { id: true, title: true, slug: true, publishedAt: true, updatedAt: true },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">仪表盘</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold">{stat.count}</p>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">最近更新的文章</h2>
        <div className="rounded-lg border bg-card">
          {recentArticles.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              暂无文章
            </div>
          ) : (
            <div className="divide-y">
              {recentArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/admin/articles/${article.id}/edit`}
                  className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-accent"
                >
                  <div>
                    <p className="font-medium">{article.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      /{article.slug}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        article.publishedAt
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {article.publishedAt ? "已发布" : "草稿"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
