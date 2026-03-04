import type { ImgHTMLAttributes } from "react";

/**
 * Enhanced image with figure/figcaption and SVG auto-sizing.
 * Maps to <img> elements in MDX.
 *
 * Markdown: ![描述文字](url)
 * - If alt text is provided, renders as <figure> with <figcaption>
 * - SVG images get responsive sizing
 */
export function EnhancedImage({
  src,
  alt,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  if (!src) return null;

  const isSvg = src.endsWith(".svg");

  const img = (
    <img
      src={src}
      alt={alt ?? ""}
      loading="lazy"
      className={`rounded-lg ${isSvg ? "w-full max-w-2xl mx-auto" : ""}`}
      {...props}
    />
  );

  // If alt text exists (not empty), wrap in figure with caption
  if (alt) {
    return (
      <figure className="my-8">
        {img}
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {alt}
        </figcaption>
      </figure>
    );
  }

  return img;
}
