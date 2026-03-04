import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  // The slug comes as a single segment from the URL but may contain encoded "/"
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const doc = await prisma.doc.findFirst({
    where: { slug: decodedSlug, publishedAt: { not: null } },
  });

  if (!doc) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      slug: doc.slug,
      title: doc.title,
      description: doc.description,
      content: doc.content,
      category: doc.category,
    },
  });
}
