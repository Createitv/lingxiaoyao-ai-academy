import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { getArticleBySlug, getAllArticleSlugs } from "@/lib/content/articles";
import { mdxComponents } from "@/components/mdx";
import { MdxRenderer } from "@/components/mdx/mdx-renderer";

import { WechatFollowCard } from "@workspace/ui/components/wechat-follow-card";
import { ProgressButton } from "@workspace/ui/components/progress-button";
import { CommentSectionWrapper } from "@/components/comment-section-wrapper";
import { extractTocHeadings } from "@/lib/toc-utils";
import { Toc } from "@/components/toc";
import { CopyMarkdownButton } from "@/components/articles/copy-markdown-button";
import { getCurrentUser } from "@/lib/auth/session";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllArticleSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}
export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://lingxiaoyao.cn";
  const articleUrl = `${BASE_URL}/articles/${slug}`;

  return {
    title: article.title,
    description: article.summary,
    keywords: [...article.tags, "Claude", "AI教程", "人工智能"].filter(
      (v, i, a) => a.indexOf(v) === i,
    ),
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      title: article.title,
      description: article.summary,
      type: "article",
      publishedTime: article.date,
      tags: article.tags,
      url: articleUrl,
      locale: "zh_CN",
      siteName: "林逍遥 AI",
      images: article.coverUrl ? [article.coverUrl] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const [article, user] = await Promise.all([
    getArticleBySlug(slug),
    getCurrentUser(),
  ]);
  if (!article) notFound();
  const isAdmin = user?.role === "admin";

  const mdxOptions = {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeHighlight, rehypeSlug],
    },
  };

  const headings = extractTocHeadings(article.content);
  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://lingxiaoyao.cn";

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    keywords: article.tags.join(", "),
    datePublished: article.date,
    dateModified: article.date,
    url: `${BASE_URL}/articles/${slug}`,
    image: article.coverUrl,
    inLanguage: "zh-CN",
    ...(article.series && {
      isPartOf: {
        "@type": "CreativeWorkSeries",
        name: article.series,
        url: `${BASE_URL}/articles?series=${encodeURIComponent(article.series)}`,
      },
    }),
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
          <header className="py-16 md:py-24">
            <div className="px-6 lg:px-10 max-w-3xl mx-auto">
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
                {isAdmin && (
                  <>
                    <span className="opacity-30">·</span>
                    <Link
                      href={`/admin/articles/${article.id}/edit`}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        <path d="m15 5 4 4" />
                      </svg>
                      编辑
                    </Link>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Content */}
          <article className="px-6 lg:px-10 max-w-3xl mx-auto">
            <div className="prose dark:prose-invert max-w-none">
              <MdxRenderer
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
