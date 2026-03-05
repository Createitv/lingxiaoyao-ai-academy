/**
 * Build search index from database content.
 * Run: pnpm search:index
 * Output: apps/web/public/search-index.json
 */

import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const WEB_DIR = path.join(process.cwd(), "apps/web");
const OUTPUT_PATH = path.join(WEB_DIR, "public/search-index.json");

interface IndexEntry {
  id: string;
  type: "article" | "course" | "chapter";
  title: string;
  content: string;
  summary: string;
  url: string;
}

function stripMarkdown(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]+`/g, "")
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function buildArticleIndex(): Promise<IndexEntry[]> {
  const articles = await prisma.article.findMany({
    where: { publishedAt: { not: null } },
    select: { slug: true, title: true, summary: true, content: true },
  });

  return articles.map((a) => ({
    id: `article-${a.slug}`,
    type: "article" as const,
    title: a.title,
    content: stripMarkdown(a.content).slice(0, 2000),
    summary: a.summary,
    url: `/articles/${a.slug}`,
  }));
}

async function buildCourseIndex(): Promise<IndexEntry[]> {
  const courses = await prisma.course.findMany({
    where: { publishedAt: { not: null } },
    include: { chapters: { orderBy: { index: "asc" } } },
  });

  const results: IndexEntry[] = [];

  for (const course of courses) {
    results.push({
      id: `course-${course.slug}`,
      type: "course",
      title: course.title,
      content: stripMarkdown(course.content ?? course.description).slice(0, 1000),
      summary: course.description,
      url: `/courses/${course.slug}`,
    });

    for (const chapter of course.chapters) {
      results.push({
        id: `chapter-${course.slug}-${chapter.index}`,
        type: "chapter",
        title: chapter.title,
        content: stripMarkdown(chapter.content ?? "").slice(0, 1000),
        summary: `${course.title} 第${chapter.index}节`,
        url: `/courses/${course.slug}/${chapter.index}`,
      });
    }
  }

  return results;
}

async function main() {
  console.log("Building search index from database...");

  const [articles, courses] = await Promise.all([
    buildArticleIndex(),
    buildCourseIndex(),
  ]);

  const index = [...articles, ...courses];

  const publicDir = path.join(WEB_DIR, "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(index, null, 2), "utf-8");

  console.log(
    `Search index built: ${index.length} entries → ${OUTPUT_PATH}`,
  );
  console.log(`   Articles: ${articles.length}`);
  console.log(`   Courses/Chapters: ${courses.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
