import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticles } from "@/lib/content/articles";

export const metadata: Metadata = {
  title: "教程文章",
  description: "免费 AI 教程、Claude 使用技巧，持续更新。",
};

interface ArticlesPageProps {
  searchParams: Promise<{ tag?: string; series?: string }>;
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const { tag, series } = await searchParams;
  const articles = await getAllArticles();

  const filtered = articles.filter((a) => {
    if (tag && !a.tags.includes(tag)) return false;
    if (series && a.series !== series) return false;
    return true;
  });

  const allTags = Array.from(new Set(articles.flatMap((a) => a.tags)));
  const allSeries = Array.from(
    new Set(articles.map((a) => a.series).filter(Boolean) as string[]),
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">教程文章</h1>
      <p className="text-muted-foreground mb-8">
        系统学习 AI 工具使用技巧，所有文章免费阅读。
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/articles"
          className={`px-3 py-1 rounded-full text-sm border transition-colors ${
            !tag && !series
              ? "bg-primary text-primary-foreground border-primary"
              : "hover:bg-muted"
          }`}
        >
          全部
        </Link>
        {allTags.map((t) => (
          <Link
            key={t}
            href={`/articles?tag=${encodeURIComponent(t)}`}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              tag === t
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-muted"
            }`}
          >
            {t}
          </Link>
        ))}
      </div>

      {/* Series */}
      {allSeries.length > 0 && !tag && !series && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-4">系列教程</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {allSeries.map((s) => {
              const count = articles.filter((a) => a.series === s).length;
              return (
                <Link
                  key={s}
                  href={`/articles?series=${encodeURIComponent(s)}`}
                  className="p-4 border rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="font-medium">{s}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {count} 篇
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Articles List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <p className="text-muted-foreground">暂无文章。</p>
        ) : (
          filtered.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="group flex items-start gap-4 py-4 border-b last:border-0"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {article.series && (
                    <span className="text-xs text-primary font-medium">
                      {article.series}
                    </span>
                  )}
                  {article.tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <h3 className="font-medium group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {article.summary}
                </p>
                <div className="mt-2 text-xs text-muted-foreground">
                  约 {article.readingTime} 分钟阅读
                </div>
              </div>
              <div className="flex-shrink-0 text-xs text-muted-foreground pt-1 whitespace-nowrap">
                {new Date(article.date).toLocaleDateString("zh-CN")}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
