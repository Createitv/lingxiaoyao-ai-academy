"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@workspace/ui/components/button";
import { TextReveal } from "@/components/motion/text-reveal";
import { AnimatedCounter } from "@/components/motion/animated-counter";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 -z-10 animate-gradient"
        style={{
          background:
            "linear-gradient(135deg, hsl(18 60% 55% / 0.07), hsl(35 40% 70% / 0.05), hsl(25 70% 50% / 0.04), hsl(40 50% 80% / 0.03))",
          backgroundSize: "400% 400%",
        }}
      />

      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(30 10% 12%) 1px, transparent 1px), linear-gradient(90deg, hsl(30 10% 12%) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Floating decorative orbs */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full animate-float-slow opacity-[0.05] dark:opacity-[0.07]"
          style={{ background: "radial-gradient(circle, hsl(18 60% 55%), transparent 70%)" }}
        />
        <div
          className="absolute -bottom-32 -left-16 w-72 h-72 rounded-full animate-float-reverse opacity-[0.04] dark:opacity-[0.06]"
          style={{ background: "radial-gradient(circle, hsl(35 80% 55%), transparent 70%)" }}
        />
        <div className="absolute top-1/4 left-[12%] w-2.5 h-2.5 rounded-full bg-primary/10 animate-float" />
        <div className="absolute top-1/3 right-[18%] w-2 h-2 rounded-full bg-primary/15 animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-1/4 right-[25%] w-3 h-3 rounded-sm bg-primary/8 rotate-45 animate-float-reverse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="container mx-auto px-6 pb-16 pt-16 sm:pb-24 sm:pt-24 lg:px-8">
        {/* Main hero: two-column on desktop */}
        <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: text content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              AI 教育平台
            </motion.div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl leading-[1.15]">
              <TextReveal
                text="全网最系统的"
                delay={0.2}
                staggerDelay={0.04}
                className="block"
              />
              <span className="block mt-1">
                <TextReveal
                  text="Claude 学习平台"
                  delay={0.7}
                  staggerDelay={0.04}
                  className="gradient-text"
                />
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="mt-6 text-base sm:text-lg leading-relaxed text-muted-foreground max-w-lg"
            >
              从零基础到实战高手，系统化视频课程 + 免费图文教程，
              帮助每个人把 AI 真正用到日常工作中。
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.5 }}
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button asChild size="lg" className="px-8 h-12 text-base rounded-full relative overflow-hidden group">
                  <Link href="/courses">
                    <span className="relative z-10">免费开始学习</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button asChild variant="outline" size="lg" className="px-8 h-12 text-base rounded-full">
                  <Link href="/articles">浏览免费教程</Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Inline social proof stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.8 }}
              className="mt-8 flex items-center gap-6 sm:gap-8 text-sm text-muted-foreground"
            >
              <div>
                <span className="block text-xl font-bold text-foreground">
                  <AnimatedCounter target={500} suffix="+" />
                </span>
                学员信赖
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <span className="block text-xl font-bold text-foreground">
                  <AnimatedCounter target={100} suffix="+" />
                </span>
                篇免费教程
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <span className="block text-xl font-bold text-foreground">
                  <AnimatedCounter target={20} suffix="h+" />
                </span>
                视频课程
              </div>
            </motion.div>
          </div>

          {/* Right: personal brand visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Glow ring */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/15 via-orange-500/10 to-amber-500/5 animate-glow-pulse blur-xl" />

              {/* Card */}
              <div className="relative rounded-2xl border bg-card/80 backdrop-blur-sm p-8 shadow-xl max-w-sm">
                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full border-2 border-primary/20 overflow-hidden">
                    <Image
                      src="/avatar.jpg"
                      alt="林逍遥"
                      width={56}
                      height={56}
                      className="object-cover w-full h-full"
                      priority
                    />
                  </div>
                  <div>
                    <div className="font-semibold">林逍遥</div>
                    <div className="text-sm text-muted-foreground">AI 教育者 & 内容创作者</div>
                  </div>
                </div>

                {/* Quote */}
                <blockquote className="text-sm leading-relaxed text-muted-foreground italic border-l-2 border-primary/30 pl-4">
                  &ldquo;我相信 AI 不应该是少数人的特权。通过系统化的教学，
                  每个人都能把 Claude 变成自己的超级助手。&rdquo;
                </blockquote>

                {/* Tags */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {["Claude 专家", "Prompt 工程", "AI 工作流"].map((tag) => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-primary/8 text-primary/80 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Divider */}
      <div className="container mx-auto px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
    </section>
  );
}
