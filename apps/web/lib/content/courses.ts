import { prisma } from "@/lib/db/prisma";

interface ChapterItem {
  index: number;
  title: string;
  videoId: string;
  isFree: boolean;
  duration: number;
}

interface CourseWithChapters {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  coverUrl?: string;
  totalChapters: number;
  chapters: ChapterItem[];
  content?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getCourses(): Promise<CourseWithChapters[]> {
  const courses = await prisma.course.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { updatedAt: "desc" },
    include: { chapters: { orderBy: { index: "asc" } } },
  });

  return courses.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description,
    price: c.price,
    coverUrl: c.coverUrl ?? undefined,
    totalChapters: c.totalChapters,
    chapters: c.chapters.map((ch) => ({
      index: ch.index,
      title: ch.title,
      videoId: ch.videoId,
      isFree: ch.isFree,
      duration: ch.duration,
    })),
    content: c.content ?? undefined,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));
}

export async function getAllCourseSlugs(): Promise<string[]> {
  const courses = await prisma.course.findMany({
    where: { publishedAt: { not: null } },
    select: { slug: true },
  });
  return courses.map((c) => c.slug);
}

export async function getCourseBySlug(
  slug: string,
): Promise<CourseWithChapters | null> {
  const course = await prisma.course.findFirst({
    where: { slug, publishedAt: { not: null } },
    include: { chapters: { orderBy: { index: "asc" } } },
  });

  if (!course) return null;

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    price: course.price,
    coverUrl: course.coverUrl ?? undefined,
    totalChapters: course.totalChapters,
    chapters: course.chapters.map((ch) => ({
      index: ch.index,
      title: ch.title,
      videoId: ch.videoId,
      isFree: ch.isFree,
      duration: ch.duration,
    })),
    content: course.content ?? undefined,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };
}

export async function getChapterContent(
  courseSlug: string,
  chapterIndex: number,
): Promise<{
  title: string;
  videoId: string;
  isFree: boolean;
  duration: number;
  content?: string;
} | null> {
  const course = await prisma.course.findFirst({
    where: { slug: courseSlug },
    select: { id: true },
  });

  if (!course) return null;

  const chapter = await prisma.chapter.findFirst({
    where: { courseId: course.id, index: chapterIndex },
  });

  if (!chapter) return null;

  return {
    title: chapter.title,
    videoId: chapter.videoId,
    isFree: chapter.isFree,
    duration: chapter.duration,
    content: chapter.content ?? undefined,
  };
}
