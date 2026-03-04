import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, parseInt(searchParams.get("pageSize") ?? "20"));
  const search = searchParams.get("search") ?? "";

  const where = search
    ? { OR: [{ title: { contains: search } }, { slug: { contains: search } }] }
    : {};

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        tags: true,
        series: true,
        isFree: true,
        publishedAt: true,
        updatedAt: true,
      },
    }),
    prisma.article.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: { items, total, page, pageSize, hasMore: page * pageSize < total },
  });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { slug, title, summary, content, coverUrl, tags, series, sortOrder, isFree, publishedAt } = body;

  if (!slug || !title) {
    return NextResponse.json(
      { success: false, error: "slug and title are required" },
      { status: 400 },
    );
  }

  // Estimate reading time (Chinese ~300 chars/min)
  const readingTime = Math.max(
    1,
    Math.ceil((content ?? "").replace(/<[^>]+>/g, "").length / 300),
  );

  const article = await prisma.article.create({
    data: {
      slug,
      title,
      summary: summary ?? "",
      content: content ?? "",
      coverUrl: coverUrl || null,
      tags: tags ?? [],
      series: series || null,
      sortOrder: sortOrder ?? 0,
      isFree: isFree ?? true,
      readingTime,
      publishedAt: publishedAt ? new Date(publishedAt) : null,
    },
  });

  return NextResponse.json({ success: true, data: article }, { status: 201 });
}
