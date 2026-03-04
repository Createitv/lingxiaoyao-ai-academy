import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Doc, DocFrontmatter } from "@workspace/types";

const DOCS_DIR = path.join(process.cwd(), "content/docs");

// Each slug segment: alphanumeric, hyphens, underscores only
const SAFE_SEGMENT_RE = /^[a-zA-Z0-9_-]+$/;

function assertSafeSlugParts(parts: string[]): void {
  for (const part of parts) {
    if (!SAFE_SEGMENT_RE.test(part)) {
      throw new Error(`Invalid slug segment: "${part}"`);
    }
  }
}

function walkDir(dir: string, base: string[] = []): string[][] {
  if (!fs.existsSync(dir)) return [];
  const results: string[][] = [];

  fs.readdirSync(dir).forEach((item) => {
    // Skip hidden files and any traversal attempts
    if (item.startsWith(".") || item.includes("..")) return;

    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results.push(...walkDir(fullPath, [...base, item]));
    } else if (item.endsWith(".mdx") || item.endsWith(".md")) {
      const slug = item.replace(/\.(mdx|md)$/, "");
      results.push([...base, slug]);
    }
  });

  return results;
}

export async function getAllDocSlugs(): Promise<string[][]> {
  return walkDir(DOCS_DIR);
}

export async function getAllDocs(): Promise<Doc[]> {
  const slugParts = walkDir(DOCS_DIR);

  return slugParts.map((parts) => {
    const last = parts[parts.length - 1]!;
    const dirs = parts.slice(0, -1);
    const filePath = path.join(DOCS_DIR, ...dirs, `${last}.mdx`);
    const mdPath = path.join(DOCS_DIR, ...dirs, `${last}.md`);
    const actualPath = fs.existsSync(filePath) ? filePath : mdPath;

    if (!fs.existsSync(actualPath)) {
      return { slug: parts, title: last };
    }

    try {
      const raw = fs.readFileSync(actualPath, "utf-8");
      const { data } = matter(raw);
      const frontmatter = data as DocFrontmatter;

      return {
        slug: parts,
        ...frontmatter,
        title: frontmatter.title ?? last,
      } satisfies Doc;
    } catch {
      return { slug: parts, title: last };
    }
  });
}

export async function getDocBySlug(
  slug: string[],
): Promise<(Doc & { source: string }) | null> {
  // Guard: validate all slug segments
  try {
    assertSafeSlugParts(slug);
  } catch {
    return null;
  }

  const last = slug[slug.length - 1]!;
  const dirs = slug.slice(0, -1);
  const filePath = path.join(DOCS_DIR, ...dirs, `${last}.mdx`);
  const mdPath = path.join(DOCS_DIR, ...dirs, `${last}.md`);
  const actualPath = fs.existsSync(filePath) ? filePath : mdPath;

  // Extra guard: resolved path must stay within DOCS_DIR
  if (!actualPath.startsWith(DOCS_DIR)) return null;
  if (!fs.existsSync(actualPath)) return null;

  try {
    const raw = fs.readFileSync(actualPath, "utf-8");
    const { data, content } = matter(raw);
    const frontmatter = data as DocFrontmatter;

    return {
      slug,
      title: frontmatter.title ?? last,
      description: frontmatter.description,
      order: frontmatter.order,
      source: content,
    };
  } catch {
    return null;
  }
}
