import { NextRequest, NextResponse } from "next/server";
import { getArticleBySlug } from "@/lib/content/articles";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return NextResponse.json(
      { success: false, error: "文章不存在" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      slug: article.slug,
      title: article.title,
      date: article.date,
      tags: article.tags,
      series: article.series,
      isFree: article.isFree,
      summary: article.summary,
      coverUrl: article.coverUrl,
      readingTime: article.readingTime,
      content: article.content,
    },
  });
}
