import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Article, ArticleFrontmatter } from "@workspace/types";

const ARTICLES_DIR = path.join(process.cwd(), "content/articles");

// Only allow alphanumeric, hyphens, underscores — no path traversal
const SAFE_SLUG_RE = /^[a-zA-Z0-9_-]+$/;

function assertSafeSlug(slug: string): void {
  if (!SAFE_SLUG_RE.test(slug)) {
    throw new Error(`Invalid slug: "${slug}"`);
  }
}

function estimateReadingTime(content: string): number {
  const wordsPerMinute = 300; // Chinese characters
  const words = content.replace(/<[^>]+>/g, "").length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

function getArticleFiles(): string[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"));
}

export async function getAllArticles(): Promise<Article[]> {
  const files = getArticleFiles();

  const articles = files.map((file) => {
    const slug = file.replace(/\.(mdx|md)$/, "");
    const filePath = path.join(ARTICLES_DIR, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const frontmatter = data as ArticleFrontmatter;

    return {
      slug,
      ...frontmatter,
      readingTime: estimateReadingTime(content),
    } satisfies Article;
  });

  return articles.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export async function getAllArticleSlugs(): Promise<string[]> {
  return getArticleFiles().map((file) => file.replace(/\.(mdx|md)$/, ""));
}

export async function getLatestArticles(count: number): Promise<Article[]> {
  const all = await getAllArticles();
  return all.slice(0, count);
}

export async function getArticleBySlug(
  slug: string,
): Promise<(Article & { source: string }) | null> {
  // Guard: prevent path traversal
  try {
    assertSafeSlug(slug);
  } catch {
    return null;
  }

  const filePath = path.join(ARTICLES_DIR, `${slug}.mdx`);
  const mdPath = path.join(ARTICLES_DIR, `${slug}.md`);

  // Extra guard: ensure resolved path stays inside ARTICLES_DIR
  const resolvedPath = fs.existsSync(filePath) ? filePath : mdPath;
  if (!resolvedPath.startsWith(ARTICLES_DIR)) return null;

  if (!fs.existsSync(resolvedPath)) return null;

  try {
    const raw = fs.readFileSync(resolvedPath, "utf-8");
    const { data, content } = matter(raw);
    const frontmatter = data as ArticleFrontmatter;

    return {
      slug,
      ...frontmatter,
      readingTime: estimateReadingTime(content),
      source: content,
    };
  } catch {
    return null;
  }
}
