"use client";

import { useRef, useState, type ReactNode } from "react";

interface CodeBlockProps {
  children: ReactNode;
  className?: string;
}

/**
 * Enhanced code block with copy button and language label.
 * Maps to <pre> elements in MDX.
 */
export function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  // Extract language from className (e.g., "language-python" → "python")
  let language = "";
  if (children && typeof children === "object" && "props" in (children as any)) {
    const codeClassName = (children as any).props?.className ?? "";
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
    <div className="group relative">
      {language && (
        <span className="absolute right-12 top-2 text-xs text-muted-foreground/60 font-mono">
          {language}
        </span>
      )}
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-2 top-2 rounded-md px-2 py-1 text-xs text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100"
        aria-label="复制代码"
      >
        {copied ? "已复制" : "复制"}
      </button>
      <pre ref={preRef} className={className} {...props}>
        {children}
      </pre>
    </div>
  );
}
