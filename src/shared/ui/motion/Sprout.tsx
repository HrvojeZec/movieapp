"use client";
import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import { SPRINGS, STAGGER_STEP } from "./motion.constants";

interface SproutProps {
  children?: ReactNode;
  /** Position in a row of bars; each one starts a step after the previous. */
  index?: number;
  /** "up" grows a column from its bottom, "right" grows a bar from its left end. */
  direction?: "up" | "right";
  className?: string;
  /** Sizes the grown element, e.g. a bar's width or height. */
  style?: CSSProperties;
}

/** Grows its content out of its base the first time it scrolls into view, like a chart bar. */
export function Sprout({ children, index = 0, direction = "up", className, style }: SproutProps) {
  const axis = direction === "up" ? "scaleY" : "scaleX";
  return (
    <motion.div
      className={className}
      style={{ ...style, transformOrigin: direction === "up" ? "bottom" : "left" }}
      initial={{ [axis]: 0 }}
      whileInView={{ [axis]: 1 }}
      viewport={{ once: true }}
      transition={{ ...SPRINGS.gentle, delay: index * STAGGER_STEP }}
    >
      {children}
    </motion.div>
  );
}
