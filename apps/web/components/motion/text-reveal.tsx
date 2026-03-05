"use client";

import { motion, type Variants } from "framer-motion";

interface TextRevealProps {
  text: string;
  delay?: number;
  staggerDelay?: number;
  className?: string;
}

const containerVariants: Variants = {
  hidden: {},
  visible: (custom: { staggerDelay: number; delay: number }) => ({
    transition: {
      staggerChildren: custom.staggerDelay,
      delayChildren: custom.delay,
    },
  }),
};

const charVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export function TextReveal({
  text,
  delay = 0,
  staggerDelay = 0.03,
  className,
}: TextRevealProps) {
  const chars = text.split("");

  return (
    <motion.span
      variants={containerVariants}
      custom={{ staggerDelay, delay }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className={className}
      aria-label={text}
    >
      {chars.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          variants={charVariants}
          style={{ display: "inline-block" }}
          aria-hidden
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
}
