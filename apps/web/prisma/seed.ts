/**
 * Prisma Seed Script
 *
 * 从 MDX frontmatter 同步课程和章节数据到数据库。
 * 运行方式：npx prisma db seed
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const COURSES_DIR = path.join(__dirname, "../content/courses");

interface CourseFrontmatter {
  title: string;
  description: string;
  price: number;
  coverUrl?: string;
}

interface ChapterFrontmatter {
  title: string;
  courseSlug: string;
  chapterIndex: number;
  videoId?: string;
  isFree?: boolean;
  duration?: number;
}

async function main() {
  console.log("Seeding database from MDX content...\n");

  if (!fs.existsSync(COURSES_DIR)) {
    console.log("No courses directory found at", COURSES_DIR);
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
    const { data: indexData } = matter(indexRaw);
    const courseFm = indexData as CourseFrontmatter;

    // Read chapter files
    const chapterFiles = fs
      .readdirSync(dir)
      .filter(
        (f) =>
          (f.endsWith(".mdx") || f.endsWith(".md")) &&
          f !== "index.mdx" &&
          f !== "index.md"
      );

    const chapters: ChapterFrontmatter[] = chapterFiles
      .map((file) => {
        const raw = fs.readFileSync(path.join(dir, file), "utf-8");
        const { data } = matter(raw);
        return data as ChapterFrontmatter;
      })
      .sort((a, b) => a.chapterIndex - b.chapterIndex);

    // Upsert course
    const course = await prisma.course.upsert({
      where: { slug },
      update: {
        title: courseFm.title ?? slug,
        description: courseFm.description ?? "",
        price: courseFm.price ?? 0,
        coverUrl: courseFm.coverUrl || null,
        totalChapters: chapters.length,
      },
      create: {
        slug,
        title: courseFm.title ?? slug,
        description: courseFm.description ?? "",
        price: courseFm.price ?? 0,
        coverUrl: courseFm.coverUrl || null,
        totalChapters: chapters.length,
      },
    });

    console.log(
      `  Course: ${course.title} (${slug}) — ¥${course.price / 100} — ${chapters.length} chapters`
    );

    // Upsert chapters
    for (const ch of chapters) {
      await prisma.chapter.upsert({
        where: {
          courseId_index: { courseId: course.id, index: ch.chapterIndex },
        },
        update: {
          title: ch.title,
          videoId: ch.videoId ?? "",
          isFree: ch.isFree ?? false,
          duration: ch.duration ?? 0,
        },
        create: {
          courseId: course.id,
          index: ch.chapterIndex,
          title: ch.title,
          videoId: ch.videoId ?? "",
          isFree: ch.isFree ?? false,
          duration: ch.duration ?? 0,
        },
      });

      console.log(
        `    Chapter ${ch.chapterIndex}: ${ch.title} ${ch.isFree ? "(free)" : "(paid)"}`
      );
    }

    // Remove chapters that no longer exist in MDX
    const validIndices = chapters.map((ch) => ch.chapterIndex);
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

  console.log("\nSeed complete!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
