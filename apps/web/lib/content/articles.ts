import { prisma } from "@/lib/db/prisma";
import { withDatabaseFallback } from "@/lib/db/safe-query";

interface ArticleListItem {
  id: string;
  slug: string;
  title: string;
  date: string;
  tags: string[];
  series?: string;
  sortOrder: number;
  isFree: boolean;
  summary: string;
  coverUrl?: string;
  readingTime: number;
}

interface ArticleDetail extends ArticleListItem {
  content: string;
}

function mapArticle(a: {
  id: string;
  slug: string;
  title: string;
  publishedAt: Date | null;
  createdAt: Date;
  tags: string[];
  series: string | null;
  sortOrder: number;
  isFree: boolean;
  summary: string;
  coverUrl: string | null;
  readingTime: number;
}): ArticleListItem {
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    date: (a.publishedAt ?? a.createdAt).toISOString(),
    tags: a.tags,
    series: a.series ?? undefined,
    sortOrder: a.sortOrder,
    isFree: a.isFree,
    summary: a.summary,
    coverUrl: a.coverUrl ?? undefined,
    readingTime: a.readingTime,
  };
}

export async function getAllArticles(): Promise<ArticleListItem[]> {
  const articles = await withDatabaseFallback(
    () =>
      prisma.article.findMany({
        where: { publishedAt: { not: null } },
        orderBy: { publishedAt: "desc" },
      }),
    [],
    "getAllArticles",
  );

  return articles.map(mapArticle);
}

export async function getAllSeries(): Promise<string[]> {
  const results = await withDatabaseFallback(
    () =>
      prisma.article.findMany({
        where: { publishedAt: { not: null }, series: { not: null } },
        select: { series: true },
        distinct: ["series"],
        orderBy: { series: "asc" },
      }),
    [],
    "getAllSeries",
  );

  return results.map((r) => r.series).filter(Boolean) as string[];
}

export async function getSeriesArticles(
  seriesName: string,
): Promise<ArticleListItem[]> {
  const articles = await withDatabaseFallback(
    () =>
      prisma.article.findMany({
        where: { series: seriesName, publishedAt: { not: null } },
        orderBy: { sortOrder: "asc" },
      }),
    [],
    "getSeriesArticles",
  );

  return articles.map(mapArticle);
}

export async function getSeriesArticleBySlug(
  slug: string,
): Promise<ArticleDetail | null> {
  const article = await withDatabaseFallback(
    () =>
      prisma.article.findFirst({
        where: { slug, series: { not: null }, publishedAt: { not: null } },
      }),
    null,
    "getSeriesArticleBySlug",
  );

  if (!article) return null;

  return {
    ...mapArticle(article),
    content: article.content,
  };
}

export async function getArticlesBySeries(
  series: string,
): Promise<ArticleListItem[]> {
  const articles = await withDatabaseFallback(
    () =>
      prisma.article.findMany({
        where: { series, publishedAt: { not: null } },
        orderBy: { sortOrder: "asc" },
      }),
    [],
    "getArticlesBySeries",
  );

  return articles.map(mapArticle);
}

export async function getAllArticleSlugs(): Promise<string[]> {
  const articles = await withDatabaseFallback(
    () =>
      prisma.article.findMany({
        where: { publishedAt: { not: null } },
        select: { slug: true },
      }),
    [],
    "getAllArticleSlugs",
  );
  return articles.map((a) => a.slug);
}

export async function getAllArticleSlugsWithDates(): Promise<
  { slug: string; updatedAt: Date }[]
> {
  return withDatabaseFallback(
    () =>
      prisma.article.findMany({
        where: { publishedAt: { not: null } },
        select: { slug: true, updatedAt: true },
      }),
    [],
    "getAllArticleSlugsWithDates",
  );
}

export async function getLatestArticles(
  count: number,
): Promise<ArticleListItem[]> {
  const all = await getAllArticles();
  return all.slice(0, count);
}

export async function getArticleBySlug(
  slug: string,
): Promise<ArticleDetail | null> {
  const article = await withDatabaseFallback(
    () =>
      prisma.article.findFirst({
        where: { slug, publishedAt: { not: null } },
      }),
    null,
    "getArticleBySlug",
  );

  if (!article) return null;

  return {
    ...mapArticle(article),
    content: article.content,
  };
}
