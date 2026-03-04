import { NextResponse } from "next/server";
import { getCourses } from "@/lib/content/courses";

export async function GET() {
  const courses = await getCourses();

  return NextResponse.json({
    success: true,
    data: courses.map((course) => ({
      slug: course.slug,
      title: course.title,
      description: course.description,
      price: course.price,
      coverUrl: course.coverUrl,
      totalChapters: course.totalChapters,
      chapters: course.chapters.map((ch) => ({
        index: ch.index,
        title: ch.title,
        isFree: ch.isFree,
        duration: ch.duration,
      })),
    })),
  });
}
