import { NextRequest, NextResponse } from "next/server";
import { getCourseBySlug } from "@/lib/content/courses";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    return NextResponse.json(
      { success: false, error: "课程不存在" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      slug: course.slug,
      title: course.title,
      description: course.description,
      price: course.price,
      coverUrl: course.coverUrl,
      totalChapters: course.totalChapters,
      source: course.source,
      chapters: course.chapters.map((ch) => ({
        index: ch.index,
        title: ch.title,
        isFree: ch.isFree,
        duration: ch.duration,
      })),
    },
  });
}
