import { prisma } from "@/lib/db/prisma";

interface ArticleListItem {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  series?: string;
  isFree: boolean;
  summary: string;
  coverUrl?: string;
  readingTime: number;
}

interface ArticleDetail extends ArticleListItem {
  content: string;
}

export async function getAllArticles(): Promise<ArticleListItem[]> {
  const articles = await prisma.article.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
  });

  return articles.map((a) => ({
    slug: a.slug,
    title: a.title,
    date: (a.publishedAt ?? a.createdAt).toISOString(),
    tags: a.tags,
    series: a.series ?? undefined,
    isFree: a.isFree,
    summary: a.summary,
    coverUrl: a.coverUrl ?? undefined,
    readingTime: a.readingTime,
  }));
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
    slug: article.slug,
    title: article.title,
    date: (article.publishedAt ?? article.createdAt).toISOString(),
    tags: article.tags,
    series: article.series ?? undefined,
    isFree: article.isFree,
    summary: article.summary,
    coverUrl: article.coverUrl ?? undefined,
    readingTime: article.readingTime,
    content: article.content,
  };
}
