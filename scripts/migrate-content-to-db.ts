/**
 * Content Migration Script: MDX → Database
 *
 * Reads all MDX content files (articles, docs, courses/chapters)
 * and inserts them into PostgreSQL via Prisma.
 *
 * Run: npx tsx scripts/migrate-content-to-db.ts
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CONTENT_DIR = path.join(__dirname, "../apps/web/content");
const ARTICLES_DIR = path.join(CONTENT_DIR, "articles");
const DOCS_DIR = path.join(CONTENT_DIR, "docs");
const COURSES_DIR = path.join(CONTENT_DIR, "courses");

function estimateReadingTime(content: string): number {
  const chars = content.replace(/<[^>]+>/g, "").length;
  return Math.max(1, Math.ceil(chars / 300)); // ~300 chars/min for Chinese
}

// ─── Migrate Articles ───────────────────────────────────────────────────────

async function migrateArticles() {
  console.log("=== Migrating Articles ===\n");

  if (!fs.existsSync(ARTICLES_DIR)) {
    console.log("  No articles directory found, skipping.\n");
    return;
  }

  const files = fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

  for (const file of files) {
    const slug = file.replace(/\.(mdx|md)$/, "");
    const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), "utf-8");
    const { data, content } = matter(raw);

    const article = await prisma.article.upsert({
      where: { slug },
      update: {
        title: data.title ?? slug,
        summary: data.summary ?? "",
        content,
        coverUrl: data.coverUrl || null,
        tags: data.tags ?? [],
        series: data.series || null,
        isFree: data.isFree ?? true,
        readingTime: estimateReadingTime(content),
        publishedAt: data.date ? new Date(data.date) : new Date(),
      },
      create: {
        slug,
        title: data.title ?? slug,
        summary: data.summary ?? "",
        content,
        coverUrl: data.coverUrl || null,
        tags: data.tags ?? [],
        series: data.series || null,
        isFree: data.isFree ?? true,
        readingTime: estimateReadingTime(content),
        publishedAt: data.date ? new Date(data.date) : new Date(),
      },
    });

    console.log(`  Article: ${article.title} (${slug})`);
  }

  console.log(`\n  Total: ${files.length} article(s)\n`);
}

// ─── Migrate Docs ───────────────────────────────────────────────────────────

function walkDocsDir(
  dir: string,
  base: string[] = []
): Array<{ slug: string; category: string; filePath: string }> {
  if (!fs.existsSync(dir)) return [];
  const results: Array<{ slug: string; category: string; filePath: string }> =
    [];

  for (const item of fs.readdirSync(dir)) {
    if (item.startsWith(".") || item.includes("..")) continue;
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results.push(...walkDocsDir(fullPath, [...base, item]));
    } else if (item.endsWith(".mdx") || item.endsWith(".md")) {
      const name = item.replace(/\.(mdx|md)$/, "");
      const parts = [...base, name];
      results.push({
        slug: parts.join("/"),
        category: parts[0] ?? name,
        filePath: fullPath,
      });
    }
  }

  return results;
}

async function migrateDocs() {
  console.log("=== Migrating Docs ===\n");

  if (!fs.existsSync(DOCS_DIR)) {
    console.log("  No docs directory found, skipping.\n");
    return;
  }

  const docs = walkDocsDir(DOCS_DIR);

  for (const { slug, category, filePath } of docs) {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    const doc = await prisma.doc.upsert({
      where: { slug },
      update: {
        title: data.title ?? slug.split("/").pop() ?? slug,
        description: data.description || null,
        content,
        category,
        sortOrder: data.order ?? 0,
        publishedAt: new Date(),
      },
      create: {
        slug,
        title: data.title ?? slug.split("/").pop() ?? slug,
        description: data.description || null,
        content,
        category,
        sortOrder: data.order ?? 0,
        publishedAt: new Date(),
      },
    });

    console.log(`  Doc: ${doc.title} (${slug})`);
  }

  console.log(`\n  Total: ${docs.length} doc(s)\n`);
}

// ─── Migrate Courses + Chapters ──────────────────────────────────────────────

async function migrateCourses() {
  console.log("=== Migrating Courses ===\n");

  if (!fs.existsSync(COURSES_DIR)) {
    console.log("  No courses directory found, skipping.\n");
    return;
  }

  const courseDirs = fs.readdirSync(COURSES_DIR).filter((item) => {
    return fs.statSync(path.join(COURSES_DIR, item)).isDirectory();
  });

  for (const slug of courseDirs) {
    const dir = path.join(COURSES_DIR, slug);

    // Read course index.mdx
    const indexPath = fs.existsSync(path.join(dir, "index.mdx"))
      ? path.join(dir, "index.mdx")
      : path.join(dir, "index.md");

    if (!fs.existsSync(indexPath)) {
      console.log(`  Skipping ${slug}: no index.mdx found`);
      continue;
    }

    const indexRaw = fs.readFileSync(indexPath, "utf-8");
    const { data: indexData, content: indexContent } = matter(indexRaw);

    // Read chapter files
    const chapterFiles = fs
      .readdirSync(dir)
      .filter(
        (f) =>
          (f.endsWith(".mdx") || f.endsWith(".md")) &&
          f !== "index.mdx" &&
          f !== "index.md"
      );

    const chapters = chapterFiles
      .map((file) => {
        const raw = fs.readFileSync(path.join(dir, file), "utf-8");
        const { data, content } = matter(raw);
        return {
          index: data.chapterIndex as number,
          title: data.title as string,
          videoId: (data.videoId as string) ?? "",
          isFree: (data.isFree as boolean) ?? false,
          duration: (data.duration as number) ?? 0,
          content,
        };
      })
      .sort((a, b) => a.index - b.index);

    // Upsert course with content
    const course = await prisma.course.upsert({
      where: { slug },
      update: {
        title: indexData.title ?? slug,
        description: indexData.description ?? "",
        content: indexContent,
        price: indexData.price ?? 0,
        coverUrl: indexData.coverUrl || null,
        totalChapters: chapters.length,
        publishedAt: new Date(),
      },
      create: {
        slug,
        title: indexData.title ?? slug,
        description: indexData.description ?? "",
        content: indexContent,
        price: indexData.price ?? 0,
        coverUrl: indexData.coverUrl || null,
        totalChapters: chapters.length,
        publishedAt: new Date(),
      },
    });

    console.log(
      `  Course: ${course.title} (${slug}) — ¥${course.price / 100}`
    );

    // Upsert chapters with content
    for (const ch of chapters) {
      await prisma.chapter.upsert({
        where: {
          courseId_index: { courseId: course.id, index: ch.index },
        },
        update: {
          title: ch.title,
          content: ch.content,
          videoId: ch.videoId,
          isFree: ch.isFree,
          duration: ch.duration,
        },
        create: {
          courseId: course.id,
          index: ch.index,
          title: ch.title,
          content: ch.content,
          videoId: ch.videoId,
          isFree: ch.isFree,
          duration: ch.duration,
        },
      });

      console.log(
        `    Chapter ${ch.index}: ${ch.title} ${ch.isFree ? "(free)" : "(paid)"}`
      );
    }

    // Remove stale chapters
    const validIndices = chapters.map((ch) => ch.index);
    const deleted = await prisma.chapter.deleteMany({
      where: {
        courseId: course.id,
        index: { notIn: validIndices },
      },
    });
    if (deleted.count > 0) {
      console.log(`    Removed ${deleted.count} stale chapter(s)`);
    }
  }

  console.log(`\n  Total: ${courseDirs.length} course(s)\n`);
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("Starting content migration: MDX → Database\n");

  await migrateArticles();
  await migrateDocs();
  await migrateCourses();

  console.log("Migration complete!");
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
