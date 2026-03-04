/**
 * Build search index for all MDX content.
 * Run: pnpm search:index
 * Output: apps/web/public/search-index.json
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const WEB_DIR = path.join(process.cwd(), "apps/web");
const CONTENT_DIR = path.join(WEB_DIR, "content");
const OUTPUT_PATH = path.join(WEB_DIR, "public/search-index.json");

interface IndexEntry {
  id: string;
  type: "article" | "doc" | "course" | "chapter";
  title: string;
  content: string;
  summary: string;
  url: string;
}

function readMDX(filePath: string): { data: Record<string, unknown>; content: string } {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { data, content };
}

function stripMDX(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks
    .replace(/`[^`]+`/g, "")        // Remove inline code
    .replace(/#{1,6}\s/g, "")       // Remove headings markers
    .replace(/\*\*/g, "")           // Remove bold
    .replace(/\*/g, "")             // Remove italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Replace links with text
    .replace(/\n{3,}/g, "\n\n")     // Normalize newlines
    .trim();
}

function buildArticleIndex(): IndexEntry[] {
  const articlesDir = path.join(CONTENT_DIR, "articles");
  if (!fs.existsSync(articlesDir)) return [];

  return fs
    .readdirSync(articlesDir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.(mdx|md)$/, "");
      const { data, content } = readMDX(path.join(articlesDir, file));

      return {
        id: `article-${slug}`,
        type: "article" as const,
        title: (data.title as string) ?? slug,
        content: stripMDX(content).slice(0, 2000),
        summary: (data.summary as string) ?? "",
        url: `/articles/${slug}`,
      };
    });
}

function buildDocIndex(): IndexEntry[] {
  const docsDir = path.join(CONTENT_DIR, "docs");
  if (!fs.existsSync(docsDir)) return [];

  const results: IndexEntry[] = [];

  function walkDocs(dir: string, baseParts: string[]) {
    fs.readdirSync(dir).forEach((item) => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walkDocs(fullPath, [...baseParts, item]);
      } else if (item.endsWith(".mdx") || item.endsWith(".md")) {
        const slug = item.replace(/\.(mdx|md)$/, "");
        const parts = [...baseParts, slug];
        const { data, content } = readMDX(fullPath);

        results.push({
          id: `doc-${parts.join("-")}`,
          type: "doc",
          title: (data.title as string) ?? slug,
          content: stripMDX(content).slice(0, 2000),
          summary: (data.description as string) ?? "",
          url: `/docs/${parts.join("/")}`,
        });
      }
    });
  }

  walkDocs(docsDir, []);
  return results;
}

function buildCourseIndex(): IndexEntry[] {
  const coursesDir = path.join(CONTENT_DIR, "courses");
  if (!fs.existsSync(coursesDir)) return [];

  const results: IndexEntry[] = [];

  fs.readdirSync(coursesDir).forEach((courseSlug) => {
    const courseDir = path.join(coursesDir, courseSlug);
    if (!fs.statSync(courseDir).isDirectory()) return;

    // Course index
    const indexPath = path.join(courseDir, "index.mdx");
    const mdPath = path.join(courseDir, "index.md");
    const actualIndex = fs.existsSync(indexPath) ? indexPath : mdPath;

    if (fs.existsSync(actualIndex)) {
      const { data, content } = readMDX(actualIndex);
      results.push({
        id: `course-${courseSlug}`,
        type: "course",
        title: (data.title as string) ?? courseSlug,
        content: stripMDX(content).slice(0, 1000),
        summary: (data.description as string) ?? "",
        url: `/courses/${courseSlug}`,
      });
    }

    // Chapters
    fs.readdirSync(courseDir)
      .filter(
        (f) =>
          (f.endsWith(".mdx") || f.endsWith(".md")) &&
          f !== "index.mdx" &&
          f !== "index.md",
      )
      .forEach((file) => {
        const { data, content } = readMDX(path.join(courseDir, file));
        const chapterIndex = (data.chapterIndex as number) ?? 0;

        results.push({
          id: `chapter-${courseSlug}-${chapterIndex}`,
          type: "chapter",
          title: (data.title as string) ?? file,
          content: stripMDX(content).slice(0, 1000),
          summary: `${courseSlug} 第${chapterIndex}节`,
          url: `/courses/${courseSlug}/${chapterIndex}`,
        });
      });
  });

  return results;
}

async function main() {
  console.log("Building search index...");

  const articles = buildArticleIndex();
  const docs = buildDocIndex();
  const courses = buildCourseIndex();

  const index = [...articles, ...docs, ...courses];

  // Ensure public directory exists
  const publicDir = path.join(WEB_DIR, "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(index, null, 2), "utf-8");

  console.log(
    `✅ Search index built: ${index.length} entries → ${OUTPUT_PATH}`,
  );
  console.log(`   Articles: ${articles.length}`);
  console.log(`   Docs: ${docs.length}`);
  console.log(`   Courses/Chapters: ${courses.length}`);
}

main().catch(console.error);
