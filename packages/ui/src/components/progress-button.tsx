"use client";

import React, { useState } from "react";
import { cn } from "../lib/utils";

interface ProgressButtonProps {
  contentType: "article" | "chapter";
  contentSlug: string;
  isCompleted: boolean;
  className?: string;
  onToggle?: (slug: string, completed: boolean) => Promise<void>;
}

export function ProgressButton({
  contentType,
  contentSlug,
  isCompleted,
  className,
  onToggle,
}: ProgressButtonProps) {
  const [completed, setCompleted] = useState(isCompleted);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (!onToggle || isLoading) return;
    setIsLoading(true);
    try {
      const next = !completed;
      await onToggle(contentSlug, next);
      setCompleted(next);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors",
        completed
          ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
          : "bg-muted text-muted-foreground hover:bg-muted/80",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
    >
      <span>{completed ? "✅" : "○"}</span>
      <span>{completed ? "已完成" : "标记为已完成"}</span>
    </button>
  );
}
