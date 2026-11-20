"use client";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import {
  EASE_OUT,
  REVEAL_DURATION,
  REVEAL_OFFSET,
  REVEAL_VIEWPORT_MARGIN,
  STAGGER_STEP,
  STAGGER_WAVE,
} from "./motion.constants";

interface RevealProps {
  children: ReactNode;
  /** Position in a list; items fade in one after another in waves of STAGGER_WAVE. */
  index?: number;
  className?: string;
}

/**
 * Fades its children in and up the first time they scroll into view. Meant for content below
 * the fold; above-the-fold content animates with CSS so it never waits for JavaScript.
 */
export function Reveal({ children, index = 0, className }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: REVEAL_OFFSET }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: REVEAL_VIEWPORT_MARGIN }}
      transition={{
        duration: REVEAL_DURATION,
        ease: EASE_OUT,
        delay: (index % STAGGER_WAVE) * STAGGER_STEP,
      }}
    >
      {children}
    </motion.div>
  );
}
