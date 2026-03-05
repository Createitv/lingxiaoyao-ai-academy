"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { FadeIn } from "@/components/motion/fade-in";

export function InstructorSection() {
  return (
    <section className="container mx-auto px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <FadeIn>
          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-5">
              {/* Left: visual / avatar area */}
              <div className="lg:col-span-2 bg-gradient-to-br from-primary/8 via-orange-500/6 to-amber-500/4 flex items-center justify-center p-10 lg:p-12">
                <div className="relative">
                  <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-primary/20 via-orange-500/10 to-amber-500/10 animate-glow-pulse" />
                  <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-2 border-primary/20">
                    <Image
                      src="/avatar.jpg"
                      alt="林逍遥"
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 144px, 176px"
                    />
                  </div>
                </div>
              </div>

              {/* Right: text content */}
              <div className="lg:col-span-3 p-8 lg:p-10 flex flex-col justify-center">
                <p className="text-sm font-medium tracking-widest uppercase text-primary/70 mb-2">
                  About the Instructor
                </p>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl mb-1">
                  林逍遥
                </h2>
                <p className="text-muted-foreground mb-6">
                  AI 教育者 & 内容创作者
                </p>

                <p className="text-sm leading-relaxed text-muted-foreground mb-6">
                  我相信 AI 不应该是程序员的专利。通过系统化的教学设计，
                  我帮助非技术背景的学习者掌握 Claude 等 AI 工具，
                  把 AI 真正融入日常工作——写作、分析、决策，每一个环节都能用上。
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {["Claude 专家", "Prompt 工程", "企业培训", "AI 工作流"].map((tag) => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-primary/8 text-primary/80 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>

                <div>
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <Link href="/about">了解更多 →</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
