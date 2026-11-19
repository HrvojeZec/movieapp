"use client";
import { memo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { UserStats, WidgetType, WidgetView } from "@/entities/stats/types";
import { WIDGETS } from "@/features/stats/widgets/registry";
import { EASE_OUT } from "@/shared/ui/motion/motion.constants";
import classes from "./WidgetBody.module.scss";

// The old view blurs away a little upwards, the new one comes in from below
const VIEW_SWAP = {
  initial: { opacity: 0, y: 6, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -6, filter: "blur(4px)" },
};
const VIEW_SWAP_SECONDS = 0.22;

interface WidgetBodyProps {
  type: WidgetType;
  /** Cells the widget takes; the content adapts to them. */
  w: number;
  h: number;
  view: WidgetView;
  stats: UserStats;
  now: number;
}

/**
 * A widget's content, as a chart or a table. Memoized on plain values, so moving widgets around
 * the board doesn't redraw the charts inside them; only a new size, view or data does.
 */
export const WidgetBody = memo(function WidgetBody({
  type,
  w,
  h,
  view,
  stats,
  now,
}: WidgetBodyProps) {
  const reduceMotion = useReducedMotion();
  const { render, renderTable } = WIDGETS[type];
  const shown = renderTable && view === "table" ? "table" : "chart";
  const props = { stats, size: { w, h }, now };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={shown}
        className={classes.view}
        data-view={shown}
        {...VIEW_SWAP}
        transition={{ duration: reduceMotion ? 0 : VIEW_SWAP_SECONDS, ease: EASE_OUT }}
      >
        {shown === "table" ? renderTable!(props) : render(props)}
      </motion.div>
    </AnimatePresence>
  );
});
