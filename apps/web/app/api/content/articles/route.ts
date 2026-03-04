import { NextRequest, NextResponse } from "next/server";
import { getAllArticles, getArticlesBySeries } from "@/lib/content/articles";

export async function GET(req: NextRequest) {
  const series = req.nextUrl.searchParams.get("series");

  const articles = series
    ? await getArticlesBySeries(series)
    : await getAllArticles();

  return NextResponse.json({
    success: true,
    data: articles.map((article) => ({
      slug: article.slug,
      title: article.title,
      date: article.date,
      tags: article.tags,
      series: article.series,
      sortOrder: article.sortOrder,
      isFree: article.isFree,
      summary: article.summary,
      coverUrl: article.coverUrl,
      readingTime: article.readingTime,
    })),
  });
}
