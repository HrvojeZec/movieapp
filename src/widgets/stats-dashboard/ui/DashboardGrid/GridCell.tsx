"use client";
import { useDeferredValue, useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, motionValue, useReducedMotion } from "motion/react";
import type { CellMotion } from "@/features/customize-dashboard/hooks/useGridDrag";
import { cellToPixels, type GridMetrics } from "@/entities/stats/lib/grid-drag";
import type { LayoutItem } from "@/entities/stats/types";
import { SPRINGS } from "@/shared/ui/motion/motion.constants";
import classes from "./DashboardGrid.module.scss";

// Above the other widgets while it is moved and while it lands
const RAISED_Z = 2;

interface GridCellProps {
  item: LayoutItem;
  metrics: GridMetrics;
  /** A pointer is moving or resizing this widget: its motion values follow the pointer. */
  followsPointer: boolean;
  raised: boolean;
  children: (values: CellMotion, size: { w: number; h: number }) => ReactNode;
}

/**
 * One widget on the board, drawn from its own motion values. Outside a pointer gesture they
 * spring to the widget's place in the layout (with a small landing bounce right after being let
 * go); during one, the gesture moves them directly and the layout waits.
 */
export function GridCell({ item, metrics, followsPointer, raised, children }: GridCellProps) {
  const reduceMotion = useReducedMotion();
  const target = cellToPixels(item, metrics);
  const [values] = useState<CellMotion>(() => ({
    x: motionValue(target.left),
    y: motionValue(target.top),
    width: motionValue(target.width),
    height: motionValue(target.height),
    rotate: motionValue(0),
    scale: motionValue(1),
  }));
  const justReleased = useRef(false);

  useEffect(() => {
    if (followsPointer) {
      justReleased.current = true;
      return;
    }
    const spring = justReleased.current ? SPRINGS.land : SPRINGS.gentle;
    justReleased.current = false;
    const rest = {
      x: target.left,
      y: target.top,
      width: target.width,
      height: target.height,
      rotate: 0,
      scale: 1,
    };
    for (const key of Object.keys(rest) as (keyof typeof rest)[]) {
      if (reduceMotion) values[key].set(rest[key]);
      else animate(values[key], rest[key], spring);
    }
  }, [followsPointer, target.left, target.top, target.width, target.height, reduceMotion, values]);

  // The content redraws for a new size when the browser has time, not in the middle of a move
  const w = useDeferredValue(item.w);
  const h = useDeferredValue(item.h);

  return (
    <motion.div
      className={classes.cell}
      data-widget={item.type}
      style={{
        x: values.x,
        y: values.y,
        width: values.width,
        height: values.height,
        rotate: values.rotate,
        scale: values.scale,
        zIndex: raised ? RAISED_Z : undefined,
      }}
    >
      {children(values, { w, h })}
    </motion.div>
  );
}
