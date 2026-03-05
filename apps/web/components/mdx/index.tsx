import { Callout } from "./callout";
import { CodeBlock } from "./code-block";
import { ZoomImage } from "./image-zoom";

/**
 * Custom MDX component mappings for article/doc/course rendering.
 *
 * These override default HTML elements with enhanced versions:
 * - blockquote → Callout (detects Note/Tip/Warning/Important patterns)
 * - pre ��� CodeBlock (copy button + language label)
 * - img → ZoomImage (figure + figcaption + SVG sizing + click-to-zoom)
 *
 * Cross-platform note:
 * Content is written in standard Markdown. Web renders enhanced components,
 * while miniprogram falls back to standard HTML elements naturally.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mdxComponents: Record<string, React.ComponentType<any>> = {
  blockquote: Callout,
  pre: CodeBlock,
  img: ZoomImage,
};
