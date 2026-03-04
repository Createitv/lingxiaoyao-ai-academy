import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { getArticleBySlug, getAllArticleSlugs } from "@/lib/content/articles";
import { WechatFollowCard } from "@workspace/ui/components/wechat-follow-card";
import { ProgressButton } from "@workspace/ui/components/progress-button";
import { CommentSectionWrapper } from "@/components/comment-section-wrapper";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: "article",
      publishedTime: article.date,
      tags: article.tags,
      images: article.coverUrl ? [article.coverUrl] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const mdxOptions = {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeHighlight, rehypeSlug],
    },
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    datePublished: article.date,
    author: {
      "@type": "Person",
      name: "lingxiaoyao",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-3">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{article.title}</h1>
          <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
            <time dateTime={article.date}>
              {new Date(article.date).toLocaleDateString("zh-CN")}
            </time>
            <span>·</span>
            <span>约 {article.readingTime} 分钟阅读</span>
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <MDXRemote source={article.source} options={mdxOptions} />
        </div>

        {/* Footer */}
        <footer className="mt-12 space-y-6 border-t pt-8">
          <ProgressButton
            contentType="article"
            contentSlug={slug}
            isCompleted={false}
          />
          <WechatFollowCard />
          <CommentSectionWrapper
            contentType="article"
            contentSlug={slug}
          />
        </footer>
      </article>
    </>
  );
}
