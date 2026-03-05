"use client";

import { useRef, useEffect, type ImgHTMLAttributes } from "react";
import mediumZoom from "medium-zoom";
import { EnhancedImage } from "./enhanced-image";

/**
 * Wraps EnhancedImage with medium-zoom for click-to-zoom functionality.
 * Automatically attaches zoom to all <img> elements within the container.
 */
export function ZoomImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const imgs = containerRef.current.querySelectorAll("img");
    if (imgs.length === 0) return;

    const zoom = mediumZoom(imgs, {
      margin: 24,
      background: "rgba(0, 0, 0, 0.85)",
    });

    return () => {
      zoom.detach();
    };
  }, []);

  return (
    <span ref={containerRef} className="inline-block w-full">
      <EnhancedImage {...props} />
    </span>
  );
}
