"use client";
import { useId } from "react";
import { VisuallyHidden } from "@mantine/core";
import { motion } from "motion/react";
import { GRID_COLUMNS } from "@/features/stats/constants";
import { useGridColumns } from "@/features/stats/hooks/useGridColumns";
import { useGridDrag } from "@/features/stats/hooks/useGridDrag";
import { cellToPixels } from "@/features/stats/lib/grid-drag";
import { removeWidget, reorderWidget, toColumns } from "@/features/stats/lib/grid-layout";
import type { LayoutItem, UserStats, WidgetType } from "@/features/stats/types";
import type { WidgetEditControls } from "@/features/stats/ui/WidgetFrame/WidgetFrame";
import { WidgetFrame } from "@/features/stats/ui/WidgetFrame/WidgetFrame";
import { WIDGETS } from "@/features/stats/widgets/registry";
import { COLORS } from "@/shared/theme/colors";
import { SPRINGS } from "@/shared/ui/motion/motion.constants";
import classes from "./DashboardGrid.module.scss";

interface DashboardGridProps {
  /** Always the 12-column layout; narrower boards are derived from it. */
  layout: LayoutItem[];
  stats: UserStats;
  editing: boolean;
  onChange: (layout: LayoutItem[]) => void;
}

const titleOf = (type: WidgetType) => WIDGETS[type].title;
const FOLLOW_POINTER = { duration: 0 };

/**
 * The stats board: widgets placed on a grid. While customizing, a wide board moves widgets by
 * their header and resizes them by their corner (or with the keyboard); a narrow one moves
 * them up and down with buttons.
 */
export function DashboardGrid({ layout, stats, editing, onChange }: DashboardGridProps) {
  const instructionsId = useId();
  const { ref, measured, columns, metrics } = useGridColumns();
  const wide = columns === GRID_COLUMNS;
  const drag = useGridDrag({ layout, metrics, titleOf, onCommit: onChange });

  const shown = wide ? (drag.preview ?? layout) : toColumns(layout, columns);
  const order = toColumns(layout, 1).map((item) => item.type);
  const height = Math.max(
    0,
    ...shown.map((item) => {
      const { top, height: itemHeight } = cellToPixels(item, metrics);
      return top + itemHeight;
    }),
  );
  const placeholder = drag.dragging
    ? shown.find((item) => item.type === drag.dragging?.type)
    : null;

  const editControls = (type: WidgetType): WidgetEditControls | undefined => {
    if (!editing) return undefined;
    const canRemove = layout.length > 1;
    const onRemove = canRemove ? () => onChange(removeWidget(layout, type)) : undefined;
    if (wide) {
      return {
        dragProps: drag.dragProps(type),
        keyboardProps: drag.keyboardProps(type),
        resizeProps: drag.resizeProps(type),
        onRemove,
        instructionsId,
      };
    }
    const index = order.indexOf(type);
    return {
      onMoveUp: index > 0 ? () => onChange(reorderWidget(layout, type, -1)) : undefined,
      onMoveDown:
        index < order.length - 1 ? () => onChange(reorderWidget(layout, type, 1)) : undefined,
      onRemove,
      instructionsId,
    };
  };

  return (
    <div ref={ref} className={classes.board} style={{ height }}>
      {placeholder && (
        <div className={classes.placeholder} style={pixelBox(cellToPixels(placeholder, metrics))} />
      )}

      {measured &&
        shown.map((item) => {
          const { left, top, width, height: itemHeight } = cellToPixels(item, metrics);
          const following = drag.dragging?.type === item.type ? drag.dragging : null;
          const start = following ? cellToPixels(following.origin, metrics) : null;
          const widget = WIDGETS[item.type];
          const Icon = widget.icon;
          return (
            <motion.div
              key={item.type}
              className={classes.cell}
              data-widget={item.type}
              style={{ width, height: itemHeight, zIndex: drag.activeType === item.type ? 2 : 1 }}
              initial={false}
              animate={{
                x: start && following ? start.left + following.dx : left,
                y: start && following ? start.top + following.dy : top,
              }}
              transition={following ? FOLLOW_POINTER : SPRINGS.gentle}
            >
              <WidgetFrame
                title={widget.title}
                icon={<Icon size={16} color={COLORS.primary} />}
                bare={widget.bare}
                edit={editControls(item.type)}
                active={drag.activeType === item.type}
              >
                {widget.render({ stats, size: { w: item.w, h: item.h } })}
              </WidgetFrame>
            </motion.div>
          );
        })}

      <VisuallyHidden id={instructionsId}>
        Press Enter to pick the widget up, the arrow keys to move it, Shift and the arrow keys to
        resize it, Enter to drop it and Escape to put it back.
      </VisuallyHidden>
      <VisuallyHidden aria-live="polite">{drag.announcement}</VisuallyHidden>
    </div>
  );
}

const pixelBox = ({ left, top, width, height }: ReturnType<typeof cellToPixels>) => ({
  transform: `translate(${left}px, ${top}px)`,
  width,
  height,
});
