import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCourseBySlug } from "@/lib/content/courses";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseSlug: string }> }
) {
  const { courseSlug } = await params;

  // 优先从数据库读取（确保价格与订单扣款一致）
  const dbCourse = await prisma.course.findUnique({
    where: { slug: courseSlug },
  });

  if (dbCourse) {
    return NextResponse.json({
      success: true,
      data: {
        slug: dbCourse.slug,
        title: dbCourse.title,
        price: dbCourse.price,
        totalChapters: dbCourse.totalChapters,
      },
    });
  }

  // Fallback: 从 MDX 读取（数据库尚未 seed 时）
  const course = await getCourseBySlug(courseSlug);

  if (!course) {
    return NextResponse.json(
      { success: false, error: "课程不存在" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      slug: course.slug,
      title: course.title,
      price: course.price,
      totalChapters: course.totalChapters,
    },
  });
}
