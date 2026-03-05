"use client";

import { motion, type Variants } from "framer-motion";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  className?: string;
}

const getVariants = (
  direction: FadeInProps["direction"] = "up",
  distance: number = 24,
): Variants => {
  const offsets: Record<string, { x?: number; y?: number }> = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  };

  return {
    hidden: { opacity: 0, ...offsets[direction!] },
    visible: { opacity: 1, x: 0, y: 0 },
  };
};

export function FadeIn({
  children,
  delay = 0,
  duration = 0.6,
  direction = "up",
  distance = 24,
  className,
}: FadeInProps) {
  return (
    <motion.div
      variants={getVariants(direction, distance)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
