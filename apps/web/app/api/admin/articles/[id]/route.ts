import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: article });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { slug, title, summary, content, coverUrl, tags, series, sortOrder, isFree, publishedAt } = body;

  const readingTime = content
    ? Math.max(1, Math.ceil(content.replace(/<[^>]+>/g, "").length / 300))
    : undefined;

  const article = await prisma.article.update({
    where: { id },
    data: {
      ...(slug !== undefined && { slug }),
      ...(title !== undefined && { title }),
      ...(summary !== undefined && { summary }),
      ...(content !== undefined && { content, readingTime }),
      ...(coverUrl !== undefined && { coverUrl: coverUrl || null }),
      ...(tags !== undefined && { tags }),
      ...(series !== undefined && { series: series || null }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(isFree !== undefined && { isFree }),
      ...(publishedAt !== undefined && {
        publishedAt: publishedAt ? new Date(publishedAt) : null,
      }),
    },
  });

  revalidatePath("/articles");
  revalidatePath(`/articles/${article.slug}`);

  return NextResponse.json({ success: true, data: article });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const article = await prisma.article.delete({ where: { id } });

  revalidatePath("/articles");
  revalidatePath(`/articles/${article.slug}`);

  return NextResponse.json({ success: true });
}
