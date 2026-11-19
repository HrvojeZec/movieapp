"use client";
import { memo } from "react";
import type { UserStats, WidgetType } from "@/features/stats/types";
import { WIDGETS } from "@/features/stats/widgets/registry";

interface WidgetBodyProps {
  type: WidgetType;
  /** Cells the widget takes; the content adapts to them. */
  w: number;
  h: number;
  stats: UserStats;
  now: number;
}

/**
 * A widget's content. Memoized on plain values, so moving widgets around the board doesn't
 * redraw the charts inside them; only a new size or new data does.
 */
export const WidgetBody = memo(function WidgetBody({ type, w, h, stats, now }: WidgetBodyProps) {
  return WIDGETS[type].render({ stats, size: { w, h }, now });
});
