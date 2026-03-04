"use client";

import type { ReactNode } from "react";

interface CalloutProps {
  children: ReactNode;
}

const CALLOUT_TYPES: Record<string, { label: string; className: string }> = {
  Note: {
    label: "Note",
    className:
      "border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/30",
  },
  Tip: {
    label: "Tip",
    className:
      "border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-950/30",
  },
  Warning: {
    label: "Warning",
    className:
      "border-yellow-200 bg-yellow-50/50 dark:border-yellow-900/50 dark:bg-yellow-950/30",
  },
  Important: {
    label: "Important",
    className:
      "border-purple-200 bg-purple-50/50 dark:border-purple-900/50 dark:bg-purple-950/30",
  },
};

/**
 * Renders blockquotes as styled callout boxes.
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
  let content = children;

  // Check if children is an array-like structure with a <p> containing <strong>
  // MDX renders: > **Note:** text → <blockquote><p><strong>Note:</strong> text</p></blockquote>
  if (children && typeof children === "object" && "props" in (children as any)) {
    const props = (children as any).props;
    if (props?.children) {
      const firstChild = Array.isArray(props.children)
        ? props.children[0]
        : props.children;

      if (
        firstChild &&
        typeof firstChild === "object" &&
        firstChild.type === "strong"
      ) {
        const strongText = String(firstChild.props?.children ?? "").replace(
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
      className={`not-prose my-6 rounded-lg border p-4 text-sm ${config.className}`}
      role="note"
    >
      <div className="font-semibold mb-1">{config.label}</div>
      <div className="[&>p]:m-0">{children}</div>
    </div>
  );
}
