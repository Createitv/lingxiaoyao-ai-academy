"use client";

import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";

interface Article {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  readingTime: number;
}

interface ArticlesSectionProps {
  articles: Article[];
}

export function ArticlesSection({ articles }: ArticlesSectionProps) {
  if (articles.length === 0) return null;

  return (
    <section className="border-y bg-secondary/20">
      <div className="container mx-auto px-6 py-20 lg:px-8">
        <FadeIn>
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-sm font-medium tracking-widest uppercase text-primary/70 mb-2">
                Latest Articles
              </p>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                最新教程
              </h2>
              <p className="mt-2 text-muted-foreground text-sm">
                免费图文教程，持续更新 AI 使用技巧和 Prompt 工程指南
              </p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/articles">
                查看全部
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </Button>
          </div>
        </FadeIn>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerDelay={0.1}>
          {articles.map((article) => (
            <StaggerItem key={article.slug}>
              <Link
                href={`/articles/${article.slug}`}
                className="group block rounded-2xl border bg-card overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 h-full"
              >
                {/* Gradient cover placeholder */}
                <div className="h-32 bg-gradient-to-br from-primary/8 via-orange-500/6 to-amber-500/4 relative flex items-end p-4">
                  <div className="flex gap-2">
                    {article.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full bg-card/80 backdrop-blur-sm text-primary/80 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {article.summary}
                  </p>

                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <time className="tabular-nums">
                      {new Date(article.date).toLocaleDateString("zh-CN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      {article.readingTime} min
                    </span>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerChildren>

        <div className="mt-10 text-center sm:hidden">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/articles">查看全部教程</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
