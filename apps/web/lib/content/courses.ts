import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Course, ChapterFrontmatter } from "@workspace/types";

const COURSES_DIR = path.join(process.cwd(), "content/courses");

const SAFE_SLUG_RE = /^[a-zA-Z0-9_-]+$/;

function assertSafeSlug(slug: string): void {
  if (!SAFE_SLUG_RE.test(slug)) {
    throw new Error(`Invalid slug: "${slug}"`);
  }
}

interface CourseWithChapters extends Course {
  chapters: Array<{
    index: number;
    title: string;
    videoId: string;
    isFree: boolean;
    duration: number;
  }>;
  coverUrl?: string;
  source?: string;
}

function getCourseSlugs(): string[] {
  if (!fs.existsSync(COURSES_DIR)) return [];
  return fs.readdirSync(COURSES_DIR).filter((item) => {
    const stat = fs.statSync(path.join(COURSES_DIR, item));
    return stat.isDirectory();
  });
}

function readCourseIndex(
  courseSlug: string,
): { title: string; description: string; price: number; coverUrl?: string; source?: string } | null {
  // Guard: prevent path traversal
  try { assertSafeSlug(courseSlug); } catch { return null; }

  const dir = path.join(COURSES_DIR, courseSlug);
  // Ensure resolved dir stays inside COURSES_DIR
  if (!dir.startsWith(COURSES_DIR)) return null;

  const indexPath = path.join(dir, "index.mdx");
  const mdPath = path.join(dir, "index.md");
  const actualPath = fs.existsSync(indexPath) ? indexPath : mdPath;

  if (!fs.existsSync(actualPath)) return null;

  try {
    const raw = fs.readFileSync(actualPath, "utf-8");
    const { data, content } = matter(raw);

    return {
      title: data.title ?? courseSlug,
      description: data.description ?? "",
      price: data.price ?? 0,
      coverUrl: data.coverUrl,
      source: content,
    };
  } catch {
    return null;
  }
}

function readChapters(
  courseSlug: string,
): Array<{ index: number; title: string; videoId: string; isFree: boolean; duration: number }> {
  const dir = path.join(COURSES_DIR, courseSlug);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter(
      (file) =>
        (file.endsWith(".mdx") || file.endsWith(".md")) &&
        file !== "index.mdx" &&
        file !== "index.md",
    )
    .map((file) => {
      const filePath = path.join(dir, file);
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data } = matter(raw);
      const frontmatter = data as ChapterFrontmatter;

      return {
        index: frontmatter.chapterIndex,
        title: frontmatter.title,
        videoId: frontmatter.videoId ?? "",
        isFree: frontmatter.isFree ?? false,
        duration: frontmatter.duration ?? 0,
      };
    })
    .sort((a, b) => a.index - b.index);
}

export async function getCourses(): Promise<CourseWithChapters[]> {
  const slugs = getCourseSlugs();

  return slugs
    .map((slug) => {
      const index = readCourseIndex(slug);
      if (!index) return null;

      const chapters = readChapters(slug);

      return {
        id: slug,
        slug,
        title: index.title,
        description: index.description,
        price: index.price,
        coverUrl: index.coverUrl,
        totalChapters: chapters.length,
        chapters,
        createdAt: new Date(),
        updatedAt: new Date(),
      } satisfies CourseWithChapters;
    })
    .filter(Boolean) as CourseWithChapters[];
}

export async function getAllCourseSlugs(): Promise<string[]> {
  return getCourseSlugs();
}

export async function getCourseBySlug(
  slug: string,
): Promise<CourseWithChapters | null> {
  const index = readCourseIndex(slug);
  if (!index) return null;

  const chapters = readChapters(slug);

  return {
    id: slug,
    slug,
    title: index.title,
    description: index.description,
    price: index.price,
    coverUrl: index.coverUrl,
    totalChapters: chapters.length,
    chapters,
    source: index.source,
    createdAt: new Date(),
    updatedAt: new Date(),
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
  source?: string;
} | null> {
  const dir = path.join(COURSES_DIR, courseSlug);
  if (!fs.existsSync(dir)) return null;

  const files = fs.readdirSync(dir).filter(
    (f) =>
      (f.endsWith(".mdx") || f.endsWith(".md")) &&
      f !== "index.mdx" &&
      f !== "index.md",
  );

  for (const file of files) {
    const filePath = path.join(dir, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const fm = data as ChapterFrontmatter;

    if (fm.chapterIndex === chapterIndex) {
      return {
        title: fm.title,
        videoId: fm.videoId ?? "",
        isFree: fm.isFree ?? false,
        duration: fm.duration ?? 0,
        source: content,
      };
    }
  }

  return null;
}
