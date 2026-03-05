"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@workspace/ui/lib/utils";

interface ChapterNav {
  index: number;
  title: string;
  isFree: boolean;
  duration: number;
}

interface CourseSidebarProps {
  courseTitle: string;
  courseSlug: string;
  chapters: ChapterNav[];
  currentChapter: number;
  completedSlugs: string[];
  purchased: boolean;
}

export function CourseSidebar({
  courseTitle,
  courseSlug,
  chapters,
  currentChapter,
  completedSlugs,
  purchased,
}: CourseSidebarProps) {
  const [collapsed, setCollapsed] = useState(true);
  const completedSet = new Set(completedSlugs);

  const completedCount = chapters.filter((ch) =>
    completedSet.has(`${courseSlug}-${ch.index}`),
  ).length;

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="lg:hidden fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full bg-primary text-primary-foreground shadow-lg text-sm font-medium"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="shrink-0"
        >
          <path
            d="M2 4h12M2 8h12M2 12h12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        课程目录
      </button>

      {/* Overlay for mobile */}
      {!collapsed && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-background border-r overflow-y-auto transition-transform duration-200",
          "lg:sticky lg:top-16 lg:z-0 lg:h-[calc(100vh-4rem)] lg:translate-x-0 lg:border-r lg:bg-transparent lg:w-72 lg:shrink-0",
          collapsed ? "-translate-x-full" : "translate-x-0",
        )}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setCollapsed(true)}
          className="lg:hidden absolute top-3 right-3 p-1 rounded-md hover:bg-muted"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 4l8 8M12 4l-8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="p-4">
          {/* Course title */}
          <Link
            href={`/courses/${courseSlug}`}
            className="block text-sm font-semibold text-foreground hover:text-primary transition-colors mb-1"
          >
            {courseTitle}
          </Link>

          {/* Progress summary */}
          <div className="text-xs text-muted-foreground mb-4">
            {completedCount}/{chapters.length} 已完成
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-muted rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{
                width: `${chapters.length > 0 ? (completedCount / chapters.length) * 100 : 0}%`,
              }}
            />
          </div>

          {/* Chapter list */}
          <nav className="space-y-0.5">
            {chapters.map((chapter) => {
              const isActive = chapter.index === currentChapter;
              const isCompleted = completedSet.has(
                `${courseSlug}-${chapter.index}`,
              );
              const canAccess = chapter.isFree || purchased;

              return (
                <div key={chapter.index}>
                  {canAccess ? (
                    <Link
                      href={`/courses/${courseSlug}/${chapter.index}`}
                      onClick={() => setCollapsed(true)}
                      className={cn(
                        "flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors group",
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : isCompleted
                            ? "text-green-600 dark:text-green-400 hover:bg-muted"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {/* Status indicator */}
                      <span className="mt-0.5 shrink-0 w-5 h-5 flex items-center justify-center">
                        {isActive ? (
                          <span className="w-2 h-2 rounded-full bg-primary" />
                        ) : isCompleted ? (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            className="text-green-500 dark:text-green-400"
                          >
                            <path
                              d="M3 8.5l3.5 3.5L13 4"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                        )}
                      </span>

                      <span className="flex-1 leading-snug">
                        {chapter.title}
                        <span className="block text-xs text-muted-foreground mt-0.5">
                          {chapter.duration} 分钟
                          {chapter.isFree && (
                            <span className="ml-1.5 text-green-600 dark:text-green-400">
                              免费
                            </span>
                          )}
                        </span>
                      </span>
                    </Link>
                  ) : (
                    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-sm text-muted-foreground/50 cursor-not-allowed">
                      <span className="mt-0.5 shrink-0 w-5 h-5 flex items-center justify-center text-xs">
                        🔒
                      </span>
                      <span className="flex-1 leading-snug">
                        {chapter.title}
                        <span className="block text-xs mt-0.5">
                          {chapter.duration} 分钟
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
