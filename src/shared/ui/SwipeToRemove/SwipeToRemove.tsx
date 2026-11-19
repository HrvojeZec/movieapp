"use client";
import type { ReactNode } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { Trash2 } from "lucide-react";
import { motion, type PanInfo } from "motion/react";
import classes from "./SwipeToRemove.module.scss";

// The item can be pulled this far left; past the threshold it is removed when let go
const DRAG_LIMIT_PX = 160;
const REMOVE_OFFSET_PX = 96;

interface SwipeToRemoveProps {
  children: ReactNode;
  onRemove: () => void;
  /** What a swipe does, shown in the strip it reveals, e.g. "Remove from watchlist". */
  label: string;
}

/**
 * On touch screens, swiping an item to the left reveals a red strip and removes it once pulled
 * far enough. Other pointers get the item as is: it always has its own remove button too.
 */
export function SwipeToRemove({ children, onRemove, label }: SwipeToRemoveProps) {
  const touch = useMediaQuery("(pointer: coarse)");
  if (!touch) return children;

  const removeOnSwipe = (_event: PointerEvent, { offset }: PanInfo) => {
    if (offset.x < -REMOVE_OFFSET_PX) onRemove();
  };

  return (
    <div className={classes.root}>
      <div className={classes.strip} aria-hidden>
        <Trash2 size={20} />
        <span>{label}</span>
      </div>
      <motion.div
        className={classes.item}
        drag="x"
        dragConstraints={{ left: -DRAG_LIMIT_PX, right: 0 }}
        dragElastic={{ left: 0.1, right: 0 }}
        dragSnapToOrigin
        onDragEnd={removeOnSwipe}
        data-swipe-item
      >
        {children}
      </motion.div>
    </div>
  );
}
