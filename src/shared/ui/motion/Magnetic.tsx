"use client";
import { useRef, type ReactNode } from "react";
import { motion } from "motion/react";
import { useMagnetic } from "@/shared/hooks/useMagnetic";
import classes from "./Magnetic.module.scss";

interface MagneticProps {
  children: ReactNode;
  /** Takes the full width, for full-width buttons. */
  block?: boolean;
  strength?: number;
}

/** Lets a primary button lean towards the pointer while it hovers it (not on touch screens). */
export function Magnetic({ children, block = false, strength }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const style = useMagnetic(ref, { strength });

  return (
    <motion.div ref={ref} style={style} className={block ? classes.block : classes.inline}>
      {children}
    </motion.div>
  );
}
