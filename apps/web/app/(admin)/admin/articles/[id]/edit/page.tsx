import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { ArticleForm } from "@/components/admin/article-form";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">编辑文章</h1>
      <ArticleForm
        initial={{
          id: article.id,
          slug: article.slug,
          title: article.title,
          summary: article.summary,
          content: article.content,
          coverUrl: article.coverUrl ?? "",
          tags: article.tags,
          series: article.series ?? "",
          sortOrder: article.sortOrder,
          isFree: article.isFree,
          publishedAt: article.publishedAt?.toISOString() ?? null,
        }}
      />
    </div>
  );
}
