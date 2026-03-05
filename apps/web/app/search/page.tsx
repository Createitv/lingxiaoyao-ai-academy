import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { SearchInput } from "./search-input";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "搜索",
  description: "搜索文章、课程等内容",
};

const typeLabels: Record<string, string> = {
  article: "文章",
  course: "课程",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

async function searchContent(q: string) {
  if (q.length < 2) return [];

  const [articles, courses] = await Promise.all([
    prisma.article.findMany({
      where: {
        publishedAt: { not: null },
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { summary: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { publishedAt: "desc" },
      take: 10,
      select: {
        slug: true,
        title: true,
        summary: true,
        series: true,
        readingTime: true,
      },
    }),
    prisma.course.findMany({
      where: {
        publishedAt: { not: null },
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 10,
      select: {
        slug: true,
        title: true,
        description: true,
        totalChapters: true,
        price: true,
      },
    }),
  ]);

  return [
    ...articles.map((a) => ({
      type: "article" as const,
      title: a.title,
      summary: a.summary,
      url: `/articles/${a.slug}`,
      series: a.series,
      readingTime: a.readingTime,
    })),
    ...courses.map((c) => ({
      type: "course" as const,
      title: c.title,
      summary: c.description,
      url: `/courses/${c.slug}`,
      totalChapters: c.totalChapters,
      price: c.price,
    })),
  ];
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? await searchContent(query) : [];

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">搜索</h1>

      <SearchInput defaultValue={query} />

      {/* Results */}
      {query && (
        <div className="mt-8">
          <p className="text-sm text-muted-foreground mb-6">
            {results.length > 0
              ? `找到 ${results.length} 条与「${query}」相关的结果`
              : `没有找到与「${query}」相关的结果`}
          </p>

          {results.length > 0 && (
            <div className="space-y-3">
              {results.map((item) => (
                <Link
                  key={item.url}
                  href={item.url}
                  className="group block rounded-lg border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                      {typeLabels[item.type]}
                    </span>
                    {"series" in item && item.series && (
                      <span className="text-xs text-primary font-medium">
                        {item.series}
                      </span>
                    )}
                    {"readingTime" in item && (
                      <span className="text-xs text-muted-foreground">
                        约 {item.readingTime} 分钟
                      </span>
                    )}
                    {"totalChapters" in item && (
                      <span className="text-xs text-muted-foreground">
                        {item.totalChapters} 节 · 视频课程
                      </span>
                    )}
                    {"price" in item && typeof item.price === "number" && (
                      <span className="text-xs font-medium text-primary">
                        {item.price === 0
                          ? "免费"
                          : `¥${(item.price / 100).toFixed(0)}`}
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  {item.summary && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {item.summary}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}

          {results.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                试试其他关键词，或使用快捷键搜索
              </p>
              <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-xs font-medium text-muted-foreground">
                <span>&#8984;</span>K
              </kbd>
            </div>
          )}
        </div>
      )}

      {!query && (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">
            输入关键词搜索文章和课程
          </p>
          <p className="text-sm text-muted-foreground">
            也可以使用{" "}
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">&#8984;</span>K
            </kbd>{" "}
            随时打开快捷搜索
          </p>
        </div>
      )}
    </div>
  );
}
