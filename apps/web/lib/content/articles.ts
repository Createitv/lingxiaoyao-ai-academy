import { prisma } from "@/lib/db/prisma";

interface ArticleListItem {
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
  const articles = await prisma.article.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
  });

  return articles.map(mapArticle);
}

export async function getArticlesBySeries(
  series: string,
): Promise<ArticleListItem[]> {
  const articles = await prisma.article.findMany({
    where: { series, publishedAt: { not: null } },
    orderBy: { sortOrder: "asc" },
  });

  return articles.map(mapArticle);
}

export async function getAllArticleSlugs(): Promise<string[]> {
  const articles = await prisma.article.findMany({
    where: { publishedAt: { not: null } },
    select: { slug: true },
  });
  return articles.map((a) => a.slug);
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
  const article = await prisma.article.findFirst({
    where: { slug, publishedAt: { not: null } },
  });

  if (!article) return null;

  return {
    ...mapArticle(article),
    content: article.content,
  };
}
