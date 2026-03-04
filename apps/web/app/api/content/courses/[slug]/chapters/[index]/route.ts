import { NextRequest, NextResponse } from "next/server";
import { getChapterContent } from "@/lib/content/courses";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; index: string }> },
) {
  const { slug, index } = await params;
  const chapterIndex = parseInt(index, 10);

  if (isNaN(chapterIndex)) {
    return NextResponse.json(
      { success: false, error: "无效的章节索引" },
      { status: 400 },
    );
  }

  const chapter = await getChapterContent(slug, chapterIndex);
  if (!chapter) {
    return NextResponse.json(
      { success: false, error: "章节不存在" },
      { status: 404 },
    );
  }

  // Free chapters: return full content
  if (chapter.isFree) {
    return NextResponse.json({
      success: true,
      data: {
        title: chapter.title,
        videoId: chapter.videoId,
        isFree: chapter.isFree,
        duration: chapter.duration,
        source: chapter.source,
      },
    });
  }

  // Paid chapter: verify auth and purchase
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: "请先登录" },
      { status: 401 },
    );
  }

  const course = await prisma.course.findUnique({ where: { slug } });
  if (!course) {
    return NextResponse.json(
      { success: false, error: "课程不存在" },
      { status: 404 },
    );
  }

  const userCourse = await prisma.userCourse.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
  });

  if (!userCourse) {
    return NextResponse.json(
      { success: false, error: "请先购买课程" },
      { status: 403 },
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      title: chapter.title,
      videoId: chapter.videoId,
      isFree: chapter.isFree,
      duration: chapter.duration,
      source: chapter.source,
    },
  });
}
