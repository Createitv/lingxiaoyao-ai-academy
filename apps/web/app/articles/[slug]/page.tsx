import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { getArticleBySlug, getAllArticleSlugs } from "@/lib/content/articles";
import { mdxComponents } from "@/components/mdx";
import { WechatFollowCard } from "@workspace/ui/components/wechat-follow-card";
import { ProgressButton } from "@workspace/ui/components/progress-button";
import { CommentSectionWrapper } from "@/components/comment-section-wrapper";
import { extractTocHeadings } from "@/lib/toc-utils";
import { Toc } from "@/components/toc";
import { CopyMarkdownButton } from "@/components/articles/copy-markdown-button";

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

  const headings = extractTocHeadings(article.content);

  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://lingxiaoyao.cn";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    datePublished: article.date,
    url: `${BASE_URL}/articles/${slug}`,
    image: article.coverUrl,
    author: {
      "@type": "Person",
      name: "林逍遥",
    },
    publisher: {
      "@type": "Organization",
      name: "林逍遥 AI",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
      },
    },
  };

  const formattedDate = new Date(article.date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="article-detail flex">
        <div className="flex-1 min-w-0">
          {/* Hero header */}
          <header className="relative py-16 md:py-24 overflow-hidden">
            {/* Subtle grid background (dark mode only) */}
            <div className="hero-bg-grid absolute inset-0 pointer-events-none" />
            {/* Gradient glow */}
            <div className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-100">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at 30% 40%, hsl(18 60% 55% / 0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, hsl(25 70% 45% / 0.06) 0%, transparent 60%)",
                }}
              />
            </div>

            <div className="px-6 lg:px-10 max-w-3xl mx-auto relative z-10">
              {/* Series badge */}
              {article.series && (
                <div className="hero-badge">
                  {article.series.toUpperCase()}
                  {article.tags[0] && (
                    <>
                      <span className="opacity-30">·</span>
                      {article.tags[0]}
                    </>
                  )}
                </div>
              )}

              {/* Title with gradient in dark mode */}
              <h1 className="hero-title text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                {article.title}
              </h1>

              {/* Summary */}
              <p className="mt-4 text-muted-foreground text-base md:text-lg">
                {article.summary}
              </p>

              {/* Meta info */}
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm font-mono text-muted-foreground">
                <time dateTime={article.date}>{formattedDate}</time>
                <span className="opacity-30">·</span>
                <span>约 {article.readingTime} 分钟阅读</span>
                {article.tags.length > 0 && (
                  <>
                    <span className="opacity-30">·</span>
                    <div className="flex gap-2">
                      {article.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </>
                )}
                <span className="opacity-30">·</span>
                <CopyMarkdownButton content={article.content} />
              </div>
            </div>
          </header>

          {/* Content */}
          <article className="px-6 lg:px-10 max-w-3xl mx-auto">
            <div className="prose dark:prose-invert max-w-none">
              <MDXRemote
                source={article.content}
                options={mdxOptions}
                components={mdxComponents}
              />
            </div>
          </article>

          {/* Footer */}
          <footer className="px-6 lg:px-10 max-w-3xl mx-auto mt-12 space-y-6 border-t pt-8">
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
        </div>

        {/* Right TOC */}
        <Toc headings={headings} />
      </div>
    </>
  );
}
