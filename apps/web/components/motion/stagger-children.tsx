"use client";

import { motion, type Variants } from "framer-motion";

interface StaggerChildrenProps {
  children: React.ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
  className?: string;
}

const containerVariants: Variants = {
  hidden: {},
  visible: (custom: { staggerDelay: number; delayChildren: number }) => ({
    transition: {
      staggerChildren: custom.staggerDelay,
      delayChildren: custom.delayChildren,
    },
  }),
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function StaggerChildren({
  children,
  staggerDelay = 0.1,
  delayChildren = 0.2,
  className,
}: StaggerChildrenProps) {
  return (
    <motion.div
      variants={containerVariants}
      custom={{ staggerDelay, delayChildren }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  );
}
