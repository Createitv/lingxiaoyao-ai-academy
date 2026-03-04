import type { MDXComponents } from "mdx/types";
import { Callout } from "./callout";
import { CodeBlock } from "./code-block";
import { EnhancedImage } from "./enhanced-image";

/**
 * Custom MDX component mappings for article/doc/course rendering.
 *
 * These override default HTML elements with enhanced versions:
 * - blockquote → Callout (detects Note/Tip/Warning/Important patterns)
 * - pre → CodeBlock (copy button + language label)
 * - img → EnhancedImage (figure + figcaption + SVG sizing)
 *
 * Cross-platform note:
 * Content is written in standard Markdown. Web renders enhanced components,
 * while miniprogram falls back to standard HTML elements naturally.
 */
export const mdxComponents: MDXComponents = {
  blockquote: Callout as any,
  pre: CodeBlock as any,
  img: EnhancedImage as any,
};
