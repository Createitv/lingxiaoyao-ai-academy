"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@workspace/ui/components/button";
import { FadeIn } from "@/components/motion/fade-in";

export function CTASection() {
  return (
    <section>
      <div className="container mx-auto px-6 py-20 lg:px-8">
        <div
          className="relative mx-auto max-w-4xl rounded-3xl overflow-hidden p-10 sm:p-16 text-center animate-gradient"
          style={{
            background:
              "linear-gradient(135deg, hsl(18 60% 55% / 0.06), hsl(35 40% 70% / 0.08), hsl(25 50% 60% / 0.05), hsl(40 60% 75% / 0.07))",
            backgroundSize: "400% 400%",
          }}
        >
          {/* Floating orbs */}
          <div
            className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-64 w-64 rounded-full opacity-[0.06] animate-float-slow"
            style={{ background: "radial-gradient(circle, hsl(18 60% 55%), transparent 70%)" }}
          />
          <div
            className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 h-48 w-48 rounded-full opacity-[0.04] animate-float-reverse"
            style={{ background: "radial-gradient(circle, hsl(35 80% 55%), transparent 70%)" }}
          />

          <FadeIn>
            <h2 className="relative text-2xl font-bold tracking-tight sm:text-3xl">
              准备好开始你的 AI 学习之旅了吗？
            </h2>
            <p className="relative mt-4 text-muted-foreground max-w-lg mx-auto leading-relaxed">
              加入 500+ 学员的行列，从今天开始系统学习 Claude。
              免费章节随时开放，零门槛开始。
            </p>
            <div className="relative mt-8 flex flex-col sm:flex-row gap-4 justify-center">
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
                  <Link href="/about">关于讲师</Link>
                </Button>
              </motion.div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
