"use client";

import { useRef, useState, type ReactNode } from "react";

interface CodeBlockProps {
  children: ReactNode;
  className?: string;
}

/**
 * Enhanced code block with colored-dot header, language label, and copy button.
 * Maps to <pre> elements in MDX.
 *
 * Styled via .article-detail .code-block-wrapper in globals.css for techy look,
 * with graceful fallback outside article pages.
 */
export function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  // Extract language from className (e.g., "language-python" → "python")
  let language = "";
  const childObj = children as Record<string, unknown> | null;
  if (childObj && typeof childObj === "object" && "props" in childObj) {
    const codeClassName = String((childObj.props as Record<string, unknown>)?.className ?? "");
    const match = codeClassName.match(/language-(\w+)/);
    if (match) language = match[1];
  }

  async function handleCopy() {
    const text = preRef.current?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-HTTPS
    }
  }

  return (
    <div className="code-block-wrapper group relative my-6 rounded-xl border border-border overflow-hidden bg-muted/40 dark:bg-[#0a1628]">
      {/* Header bar with colored dots + language + copy */}
      <div className="code-header flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30 dark:bg-white/[0.02]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex items-center gap-3">
          {language && (
            <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/60">
              {language}
            </span>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-md px-2 py-0.5 text-xs text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100"
            aria-label="复制代码"
          >
            {copied ? "已复制" : "复制"}
          </button>
        </div>
      </div>
      {/* Code body */}
      <pre
        ref={preRef}
        className={`p-5 text-sm leading-relaxed overflow-x-auto font-mono border-0 rounded-none m-0 bg-transparent ${className ?? ""}`}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}
