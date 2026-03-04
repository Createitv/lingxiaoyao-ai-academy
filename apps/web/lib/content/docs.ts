import { prisma } from "@/lib/db/prisma";

interface DocListItem {
  slug: string[];
  title: string;
  description?: string;
  order?: number;
}

interface DocDetail extends DocListItem {
  content: string;
}

export async function getAllDocSlugs(): Promise<string[][]> {
  const docs = await prisma.doc.findMany({
    where: { publishedAt: { not: null } },
    select: { slug: true },
  });
  return docs.map((d) => d.slug.split("/"));
}

export async function getAllDocs(): Promise<DocListItem[]> {
  const docs = await prisma.doc.findMany({
    where: { publishedAt: { not: null } },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });

  return docs.map((d) => ({
    slug: d.slug.split("/"),
    title: d.title,
    description: d.description ?? undefined,
    order: d.sortOrder,
  }));
}

export async function getDocBySlug(
  slug: string[],
): Promise<DocDetail | null> {
  const slugStr = slug.join("/");
  const doc = await prisma.doc.findFirst({
    where: { slug: slugStr, publishedAt: { not: null } },
  });

  if (!doc) return null;

  return {
    slug: doc.slug.split("/"),
    title: doc.title,
    description: doc.description ?? undefined,
    order: doc.sortOrder,
    content: doc.content,
  };
}
