"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValue, animate, useInView } from "framer-motion";

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function AnimatedCounter({
  target,
  duration = 2,
  suffix = "",
  prefix = "",
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const count = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const unsubscribe = count.on("change", (v) => {
      // Use one decimal for non-integer targets (like 4.9)
      if (Number.isInteger(target)) {
        setDisplay(Math.round(v));
      } else {
        setDisplay(Math.round(v * 10) / 10);
      }
    });
    return unsubscribe;
  }, [count, target]);

  useEffect(() => {
    if (isInView) {
      animate(count, target, { duration, ease: "easeOut" });
    }
  }, [isInView, count, target, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
