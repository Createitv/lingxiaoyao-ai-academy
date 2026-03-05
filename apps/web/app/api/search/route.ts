import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

interface SearchResult {
  type: "article" | "course";
  slug: string;
  title: string;
  summary: string;
  url: string;
  meta?: Record<string, unknown>;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({
      success: true,
      data: [] as SearchResult[],
    });
  }

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
      take: 5,
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
      take: 5,
      select: {
        slug: true,
        title: true,
        description: true,
        totalChapters: true,
        price: true,
      },
    }),
  ]);

  const results: SearchResult[] = [
    ...articles.map((a) => ({
      type: "article" as const,
      slug: a.slug,
      title: a.title,
      summary: a.summary,
      url: `/articles/${a.slug}`,
      meta: { series: a.series, readingTime: a.readingTime },
    })),
    ...courses.map((c) => ({
      type: "course" as const,
      slug: c.slug,
      title: c.title,
      summary: c.description,
      url: `/courses/${c.slug}`,
      meta: { totalChapters: c.totalChapters, price: c.price },
    })),
  ];

  return NextResponse.json({ success: true, data: results });
}
