"use client";
import { type RefObject, useEffect } from "react";
import { type MotionValue, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { MAGNET_MAX_PX, SPRINGS } from "@/shared/ui/motion/motion.constants";

const clampUnit = (value: number) => Math.min(Math.max(value, -1), 1);

/**
 * Lets an element lean towards the pointer while it hovers it. Pass the result as the `style`
 * of a motion element. Off on touch screens (no hover) and with reduced motion.
 */
export function useMagnetic(
  ref: RefObject<HTMLElement | null>,
  { strength = 1 }: { strength?: number } = {},
): { x: MotionValue<number>; y: MotionValue<number> } {
  const reduceMotion = useReducedMotion();
  const pullX = useMotionValue(0);
  const pullY = useMotionValue(0);
  const x = useSpring(pullX, SPRINGS.snappy);
  const y = useSpring(pullY, SPRINGS.snappy);

  useEffect(() => {
    const element = ref.current;
    if (!element || reduceMotion || window.matchMedia("(pointer: coarse)").matches) return;
    const reach = MAGNET_MAX_PX * strength;

    const lean = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      const fromCenterX = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const fromCenterY = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      pullX.set(clampUnit(fromCenterX) * reach);
      pullY.set(clampUnit(fromCenterY) * reach);
    };
    const release = () => {
      pullX.set(0);
      pullY.set(0);
    };

    element.addEventListener("pointermove", lean);
    element.addEventListener("pointerleave", release);
    return () => {
      element.removeEventListener("pointermove", lean);
      element.removeEventListener("pointerleave", release);
      release();
    };
  }, [ref, reduceMotion, strength, pullX, pullY]);

  return { x, y };
}
