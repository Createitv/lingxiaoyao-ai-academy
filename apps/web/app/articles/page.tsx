import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticles, getAllSeries } from "@/lib/content/articles";
import { ArticleCover } from "@/components/article-cover";
import { getCurrentUser } from "@/lib/auth/session";

interface ArticlesPageProps {
  searchParams: Promise<{ series?: string }>;
}

export async function generateMetadata({
  searchParams,
}: ArticlesPageProps): Promise<Metadata> {
  const { series } = await searchParams;
  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://lingxiaoyao.cn";

  if (series) {
    return {
      title: `${series} — 免费教程系列`,
      description: `${series}系列全部文章。系统学习 AI 工具使用技巧，所有文章免费阅读。`,
      keywords: [series, "Claude", "AI教程", "免费教程", "人工智能"],
      alternates: {
        canonical: `${BASE_URL}/articles?series=${encodeURIComponent(series)}`,
      },
      openGraph: {
        title: `${series} — 免费教程系列`,
        description: `${series}系列全部文章。系统学习 AI 工具使用技巧，所有文章免费阅读。`,
        type: "website",
        url: `${BASE_URL}/articles?series=${encodeURIComponent(series)}`,
        locale: "zh_CN",
        siteName: "林逍遥 AI",
      },
    };
  }

  return {
    title: "教程文章",
    description:
      "免费 AI 教程、Claude 使用技巧，持续更新。21天学习Claude系列带你从入门到精通。",
    keywords: ["AI教程", "Claude教程", "Prompt工程", "免费教程", "人工智能"],
    alternates: {
      canonical: `${BASE_URL}/articles`,
    },
  };
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const { series } = await searchParams;
  const [articles, allSeries, user] = await Promise.all([
    getAllArticles(),
    getAllSeries(),
    getCurrentUser(),
  ]);
  const isAdmin = user?.role === "admin";

  // Filter articles
  const filtered = series
    ? articles.filter((a) => a.series === series)
    : articles;

  // Sort filtered articles by sortOrder for series view
  const displayed = series
    ? [...filtered].sort((a, b) => a.sortOrder - b.sortOrder)
    : filtered;

  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://lingxiaoyao.cn";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: series ? `${series} — 免费教程系列` : "教程文章",
    description: series
      ? `${series}系列全部文章`
      : "免费 AI 教程、Claude 使用技巧",
    url: series
      ? `${BASE_URL}/articles?series=${encodeURIComponent(series)}`
      : `${BASE_URL}/articles`,
    publisher: {
      "@type": "Organization",
      name: "林逍遥 AI",
      url: BASE_URL,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: displayed.length,
      itemListElement: displayed.map((a, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${BASE_URL}/articles/${a.slug}`,
        name: a.title,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <div className="px-6 py-8 lg:px-10">
      <h1 className="text-2xl font-bold mb-2">
        {series ?? "教程文章"}
      </h1>
      <p className="text-muted-foreground mb-8">
        系统学习 AI 工具使用技巧，所有文章免费阅读。
      </p>

      {/* Series filter tabs */}
      {allSeries.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href="/articles"
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm transition-colors ${
              !series
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            全部
          </Link>
          {allSeries.map((s) => (
            <Link
              key={s}
              href={`/articles?series=${encodeURIComponent(s)}`}
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm transition-colors ${
                series === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </Link>
          ))}
        </div>
      )}

      {/* Article cards */}
      {displayed.length === 0 ? (
        <p className="text-muted-foreground">暂无文章。</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map((article) => (
            <div
              key={article.slug}
              className="group relative rounded-lg border border-white/5 overflow-hidden transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <Link
                href={`/articles/${article.slug}`}
                className="block"
              >
                {/* Cover image on top */}
                <div className="relative aspect-[16/9]">
                  {article.coverUrl ? (
                    <img
                      src={article.coverUrl}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                      aria-hidden="true"
                    />
                  ) : (
                    <ArticleCover
                      title={article.title}
                      series={article.series}
                    />
                  )}
                </div>

                {/* Card content below the image */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    {article.series && (
                      <span className="text-xs font-medium text-cyan-400/90">
                        {article.series}
                      </span>
                    )}
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {article.readingTime} min
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 text-[15px] leading-snug">
                    {article.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {article.summary}
                  </p>
                </div>
              </Link>

              {/* Admin edit button */}
              {isAdmin && (
                <Link
                  href={`/admin/articles/${article.id}/edit`}
                  className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 rounded-md bg-background/80 backdrop-blur-sm px-2 py-1 text-xs text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                  </svg>
                  编辑
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
