import { request } from "@/utils/request";

interface CourseListItem {
  slug: string;
  title: string;
  description: string;
  price: number;
  coverUrl?: string;
  totalChapters: number;
  chapters: Array<{
    index: number;
    title: string;
    isFree: boolean;
    duration: number;
  }>;
}

interface CourseDetail extends CourseListItem {
  content?: string; // Markdown content
}

interface ChapterContent {
  title: string;
  videoId: string;
  isFree: boolean;
  duration: number;
  content?: string; // Markdown content
}

export async function getCourses(): Promise<CourseListItem[]> {
  const res = await request<CourseListItem[]>({
    url: "/api/content/courses",
  });
  return res.data ?? [];
}

export async function getCourseBySlug(
  slug: string,
): Promise<CourseDetail | null> {
  const res = await request<CourseDetail>({
    url: `/api/content/courses/${slug}`,
  });
  return res.data ?? null;
}

export async function getChapterContent(
  courseSlug: string,
  chapterIndex: number,
): Promise<ChapterContent | null> {
  const res = await request<ChapterContent>({
    url: `/api/content/courses/${courseSlug}/chapters/${chapterIndex}`,
    needAuth: false, // Free chapters don't need auth
  });

  if (!res.success && res.error === "请先登录") {
    // Retry with auth for paid chapters
    const authRes = await request<ChapterContent>({
      url: `/api/content/courses/${courseSlug}/chapters/${chapterIndex}`,
      needAuth: true,
    });
    return authRes.data ?? null;
  }

  return res.data ?? null;
}
