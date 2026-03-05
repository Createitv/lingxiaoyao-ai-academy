"use client";

import { FadeIn } from "@/components/motion/fade-in";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";

const testimonials = [
  {
    content: "这是我看过最系统的 Claude 教程。从零基础到能独立完成工作任务，整个过程非常流畅，每一步都有实际的工作案例。",
    author: "张明",
    role: "产品经理",
    rating: 5,
  },
  {
    content: "企业培训方案非常专业，帮我们团队快速上手了 AI 工具。培训后团队效率明显提升，特别是在文档处理和数据分析方面。",
    author: "李雪",
    role: "创业公司 CEO",
    rating: 5,
  },
  {
    content: "作为一个完全不懂技术的文科生，这个课程让我第一次觉得 AI 是可以为我所用的。Prompt 模板库特别实用，直接套用到日常写作中。",
    author: "王芳",
    role: "自由撰稿人",
    rating: 5,
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5 text-amber-500">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export function SocialProofSection() {
  return (
    <section className="border-y bg-secondary/20">
      <div className="container mx-auto px-6 py-20 lg:px-8">
        <FadeIn className="text-center mb-14">
          <p className="text-sm font-medium tracking-widest uppercase text-primary/70 mb-2">
            Testimonials
          </p>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            听听学员怎么说
          </h2>
        </FadeIn>

        <StaggerChildren className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6" staggerDelay={0.12}>
          {testimonials.map((t) => (
            <StaggerItem key={t.author}>
              <div className="rounded-2xl border bg-card p-6 h-full flex flex-col">
                <StarRating count={t.rating} />
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground flex-1">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="mt-5 pt-4 border-t flex items-center gap-3">
                  {/* Avatar placeholder */}
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.author}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
