import { NextResponse } from "next/server";
import { getAllArticles } from "@/lib/content/articles";

export async function GET() {
  const articles = await getAllArticles();

  return NextResponse.json({
    success: true,
    data: articles.map((article) => ({
      slug: article.slug,
      title: article.title,
      date: article.date,
      tags: article.tags,
      series: article.series,
      isFree: article.isFree,
      summary: article.summary,
      coverUrl: article.coverUrl,
      readingTime: article.readingTime,
    })),
  });
}
