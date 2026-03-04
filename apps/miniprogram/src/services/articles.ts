import { request } from "@/utils/request";
import type { Article } from "@workspace/types";

interface ArticleDetail extends Article {
  content: string; // Markdown content
}

export async function getArticles(): Promise<Article[]> {
  const res = await request<Article[]>({
    url: "/api/content/articles",
  });
  return res.data ?? [];
}

export async function getArticleBySlug(
  slug: string,
): Promise<ArticleDetail | null> {
  const res = await request<ArticleDetail>({
    url: `/api/content/articles/${slug}`,
  });
  return res.data ?? null;
}
