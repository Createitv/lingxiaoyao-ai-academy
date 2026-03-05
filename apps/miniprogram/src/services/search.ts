import { request } from "@/utils/request";

export interface SearchResult {
  type: "article" | "course";
  slug: string;
  title: string;
  summary: string;
  url: string;
  meta?: {
    series?: string;
    readingTime?: number;
    totalChapters?: number;
    price?: number;
  };
}

export async function search(q: string): Promise<SearchResult[]> {
  if (q.trim().length < 2) return [];
  const res = await request<SearchResult[]>({
    url: `/api/search?q=${encodeURIComponent(q.trim())}`,
  });
  return res.data ?? [];
}
