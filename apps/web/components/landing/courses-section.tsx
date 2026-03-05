"use client";

import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";

interface Course {
  slug: string;
  title: string;
  description: string;
  price: number;
  coverUrl?: string | null;
  totalChapters: number;
  chapters: { duration: number }[];
}

interface CoursesSectionProps {
  courses: Course[];
}

function getDifficultyInfo(slug: string) {
  const map: Record<string, { label: string; color: string }> = {
    "claude-for-everyone": { label: "入门", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    "ai-enterprise-custom": { label: "进阶", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  };
  return map[slug] ?? { label: "通用", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" };
}

export function CoursesSection({ courses }: CoursesSectionProps) {
  if (courses.length === 0) return null;

  return (
    <section className="container mx-auto px-6 py-20 lg:px-8">
      <FadeIn>
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-sm font-medium tracking-widest uppercase text-primary/70 mb-2">
              Courses
            </p>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              系统化课程
            </h2>
            <p className="mt-2 text-muted-foreground text-sm max-w-lg">
              视频课程 + 实战练习，从入门到精通循序渐进。部分章节免费开放试学。
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/courses">
              查看全部
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </Button>
        </div>
      </FadeIn>

      <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const difficulty = getDifficultyInfo(course.slug);
          const totalMinutes = course.chapters.reduce((acc, ch) => acc + ch.duration, 0);
          const hours = Math.floor(totalMinutes / 60);
          const mins = totalMinutes % 60;
          const durationText = hours > 0 ? `${hours}h ${mins}min` : `${mins} min`;

          return (
            <StaggerItem key={course.slug}>
              <Link
                href={`/courses/${course.slug}`}
                className="group block rounded-2xl border bg-card overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 h-full"
              >
                {/* Cover */}
                {course.coverUrl ? (
                  <div className="aspect-[16/9] bg-muted overflow-hidden relative">
                    <img
                      src={course.coverUrl}
                      alt={course.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />
                    {/* Difficulty badge overlay */}
                    <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium ${difficulty.color} backdrop-blur-sm`}>
                      {difficulty.label}
                    </span>
                  </div>
                ) : (
                  <div className="aspect-[16/9] bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 flex items-center justify-center relative">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary/30">
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                    </svg>
                    <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium ${difficulty.color}`}>
                      {difficulty.label}
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-semibold text-lg leading-snug group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Meta row */}
                  <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="6 3 20 12 6 21 6 3" />
                      </svg>
                      {course.totalChapters} 节课
                    </span>
                    <span className="flex items-center gap-1">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      {durationText}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <span className="font-semibold text-primary text-lg">
                      {course.price === 0 ? "免费" : `\u00A5${(course.price / 100).toFixed(0)}`}
                    </span>
                    <span className="text-xs text-primary/70 font-medium group-hover:underline">
                      查看详情 →
                    </span>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          );
        })}
      </StaggerChildren>

      <div className="mt-10 text-center sm:hidden">
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/courses">查看全部课程</Link>
        </Button>
      </div>
    </section>
  );
}
