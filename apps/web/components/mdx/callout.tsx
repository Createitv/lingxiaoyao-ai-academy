"use client";

import type { ReactNode } from "react";

interface CalloutProps {
  children: ReactNode;
}

const CALLOUT_TYPES: Record<
  string,
  { label: string; icon: string; className: string }
> = {
  Note: {
    label: "Note",
    icon: "\u{1F4DD}",
    className:
      "border-blue-200 bg-blue-50/50 dark:border-blue-800/40 dark:bg-blue-950/20",
  },
  Tip: {
    label: "Tip",
    icon: "\u{1F4A1}",
    className:
      "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/40 dark:bg-emerald-950/20",
  },
  Warning: {
    label: "Warning",
    icon: "\u{26A0}\u{FE0F}",
    className:
      "border-amber-200 bg-amber-50/50 dark:border-amber-800/40 dark:bg-amber-950/20",
  },
  Important: {
    label: "Important",
    icon: "\u{26A1}",
    className:
      "border-purple-200 bg-purple-50/50 dark:border-purple-800/40 dark:bg-purple-950/20",
  },
};

/**
 * Renders blockquotes as styled callout boxes with icons.
 *
 * Markdown convention (cross-platform compatible):
 * > **Note:** This is a note.
 * > **Tip:** This is a tip.
 * > **Warning:** This is a warning.
 *
 * On Web: renders as styled Callout with icon.
 * On miniprogram: renders as standard <blockquote> (graceful degradation).
 */
export function Callout({ children }: CalloutProps) {
  // Try to detect callout type from first child text
  let type = "";

  // Check if children is an array-like structure with a <p> containing <strong>
  // MDX renders: > **Note:** text → <blockquote><p><strong>Note:</strong> text</p></blockquote>
  const childObj = children as Record<string, unknown> | null;
  if (childObj && typeof childObj === "object" && "props" in childObj) {
    const props = childObj.props as Record<string, unknown> | undefined;
    const pChildren = props?.children;
    if (pChildren) {
      const firstChild = Array.isArray(pChildren)
        ? pChildren[0]
        : pChildren;

      const fc = firstChild as Record<string, unknown> | null;
      if (
        fc &&
        typeof fc === "object" &&
        fc.type === "strong"
      ) {
        const fcProps = fc.props as Record<string, unknown> | undefined;
        const strongText = String(fcProps?.children ?? "").replace(
          /:$/,
          "",
        );
        if (strongText in CALLOUT_TYPES) {
          type = strongText;
        }
      }
    }
  }

  const config = type ? CALLOUT_TYPES[type] : null;

  if (!config) {
    // Standard blockquote fallback
    return (
      <blockquote className="border-l-4 border-primary/30 pl-4 italic">
        {children}
      </blockquote>
    );
  }

  return (
    <div
      className={`not-prose my-6 flex gap-4 rounded-xl border p-4 text-sm ${config.className}`}
      role="note"
    >
      <div className="text-lg flex-shrink-0 mt-0.5" aria-hidden="true">
        {config.icon}
      </div>
      <div className="min-w-0">
        <div className="font-semibold mb-1 text-foreground">{config.label}</div>
        <div className="[&>p]:m-0 text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}
