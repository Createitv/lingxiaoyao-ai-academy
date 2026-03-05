"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@workspace/ui/components/button";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";
import { FadeIn } from "@/components/motion/fade-in";

const pathways = [
  {
    badge: "入门",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    title: "零基础入门 AI",
    description:
      "从来没用过 AI？没关系。从认识 Claude 开始，一步步学会提问、对话和解决实际问题。适合完全零基础的学习者。",
    cta: "开始入门",
    href: "/courses/claude-for-everyone",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4" /><path d="m16.2 7.8 2.9-2.9" /><path d="M18 12h4" /><path d="m16.2 16.2 2.9 2.9" /><path d="M12 18v4" /><path d="m4.9 19.1 2.9-2.9" /><path d="M2 12h4" /><path d="m4.9 4.9 2.9 2.9" />
      </svg>
    ),
  },
  {
    badge: "进阶",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    title: "提升职场竞争力",
    description:
      "已经会用 AI 了？学习高级 Prompt 技巧、工作流自动化和团队协作方案，让 AI 成为你升职加薪的助力。",
    cta: "进阶学习",
    href: "/courses",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3v12" /><path d="M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /><path d="M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /><path d="M15 6a9 9 0 0 0-9 9" /><path d="M18 15v6" /><path d="M21 18h-6" />
      </svg>
    ),
  },
  {
    badge: "企业",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    title: "企业 AI 落地",
    description:
      "为你的团队量身定制 AI 培训方案。从能力诊断到工具部署，帮助 10~500 人的企业系统性导入 AI 工作流。",
    cta: "了解企业方案",
    href: "/courses/ai-enterprise-custom",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="16" height="20" x="4" y="2" rx="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" />
      </svg>
    ),
  },
];

export function FeaturesSection() {
  return (
    <section className="container mx-auto px-6 py-20 lg:px-8">
      <FadeIn className="mx-auto max-w-2xl text-center mb-14">
        <p className="text-sm font-medium tracking-widest uppercase text-primary/70 mb-2">
          Learning Pathways
        </p>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          选择适合你的学习路径
        </h2>
        <p className="mt-3 text-muted-foreground">
          无论你是 AI 新手、职场进阶者还是企业管理者，都能找到合适的起点
        </p>
      </FadeIn>

      <StaggerChildren className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
        {pathways.map((pathway) => (
          <StaggerItem key={pathway.title}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="group relative rounded-2xl border bg-card p-7 transition-shadow hover:shadow-lg overflow-hidden h-full flex flex-col"
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/60 via-orange-500/40 to-amber-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Badge */}
              <span className={`inline-flex self-start px-2.5 py-1 rounded-full text-xs font-medium mb-4 ${pathway.badgeColor}`}>
                {pathway.badge}
              </span>

              {/* Icon */}
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                {pathway.icon}
              </div>

              <h3 className="text-lg font-semibold mb-2">{pathway.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground flex-1">
                {pathway.description}
              </p>

              <div className="mt-5 pt-4 border-t">
                <Button asChild variant="ghost" size="sm" className="px-0 text-primary hover:text-primary">
                  <Link href={pathway.href} className="group/link flex items-center gap-1.5">
                    {pathway.cta}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover/link:translate-x-1">
                      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                    </svg>
                  </Link>
                </Button>
              </div>
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerChildren>
    </section>
  );
}
