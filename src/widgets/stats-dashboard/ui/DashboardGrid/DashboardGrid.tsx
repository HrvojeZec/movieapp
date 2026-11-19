"use client";
import { useId, type CSSProperties } from "react";
import { VisuallyHidden } from "@mantine/core";
import { motion } from "motion/react";
import { GRID_COLUMNS } from "@/entities/stats/constants";
import { Text } from "@mantine/core";
import { useGridColumns } from "@/widgets/stats-dashboard/hooks/useGridColumns";
import { useGridDrag, type CellMotion } from "@/features/customize-dashboard/hooks/useGridDrag";
import { cellToPixels } from "@/entities/stats/lib/grid-drag";
import {
  removeWidget,
  reorderWidget,
  setWidgetView,
  toColumns,
} from "@/entities/stats/lib/grid-layout";
import type { LayoutItem, UserStats, WidgetType } from "@/entities/stats/types";
import { ViewToggle } from "@/features/customize-dashboard/ui/ViewToggle/ViewToggle";
import { WidgetBody } from "@/widgets/stats-dashboard/ui/WidgetBody/WidgetBody";
import type { WidgetEditControls } from "@/widgets/stats-dashboard/ui/WidgetFrame/WidgetFrame";
import { WidgetFrame } from "@/widgets/stats-dashboard/ui/WidgetFrame/WidgetFrame";
import { WIDGETS } from "@/widgets/stats-dashboard/registry";
import { COLORS } from "@/shared/theme/colors";
import { SPRINGS } from "@/shared/ui/motion/motion.constants";
import { GridCell } from "./GridCell";
import classes from "./DashboardGrid.module.scss";

interface DashboardGridProps {
  /** Always the 12-column layout; narrower boards are derived from it. */
  layout: LayoutItem[];
  stats: UserStats;
  editing: boolean;
  onChange: (layout: LayoutItem[]) => void;
  /** When the stats were loaded (ms). */
  now: number;
}

const titleOf = (type: WidgetType) => WIDGETS[type].title;

/**
 * The stats board: widgets placed on a grid. While customizing, a wide board moves widgets by
 * their header and resizes them by their corner (or with the keyboard); a narrow one moves
 * them up and down with buttons. A dashed outline shows where a moved widget will land.
 */
export function DashboardGrid({ layout, stats, editing, onChange, now }: DashboardGridProps) {
  const instructionsId = useId();
  const { ref, measured, columns, metrics } = useGridColumns();
  const wide = columns === GRID_COLUMNS;
  const drag = useGridDrag({ layout, metrics, titleOf, onCommit: onChange });

  const shown = wide ? (drag.preview ?? layout) : toColumns(layout, columns);
  // Drawn in the saved order, with positions from the preview: reordering the DOM in the middle
  // of a drag would make the browser drop the pointer (and the gesture with it)
  const placed = new Map(shown.map((item) => [item.type, item]));
  const cells = (wide ? layout : shown).map((item) => placed.get(item.type) ?? item);
  const order = toColumns(layout, 1).map((item) => item.type);
  const height = Math.max(
    0,
    ...shown.map((item) => {
      const { top, height: itemHeight } = cellToPixels(item, metrics);
      return top + itemHeight;
    }),
  );
  const landing = drag.pointerType ? shown.find((item) => item.type === drag.pointerType) : null;
  // Where the pointer aims when the widget can't go there, kept inside the grid
  const refusedItem = drag.refused ? shown.find((item) => item.type === drag.refused?.type) : null;
  const refused =
    drag.refused && refusedItem
      ? {
          ...refusedItem,
          x: Math.min(Math.max(drag.refused.x, 0), GRID_COLUMNS - refusedItem.w),
          y: Math.max(drag.refused.y, 0),
        }
      : null;

  const editControls = (type: WidgetType, values: CellMotion): WidgetEditControls | undefined => {
    if (!editing) return undefined;
    const canRemove = layout.length > 1;
    const onRemove = canRemove ? () => onChange(removeWidget(layout, type)) : undefined;
    if (wide) {
      return {
        dragProps: drag.dragProps(type, values),
        keyboardProps: drag.keyboardProps(type),
        resizeProps: drag.resizeProps(type, values),
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

  // The grid's cells as dots behind the widgets while customizing
  const gridLines = {
    "--cell-w": `${metrics.cellWidth}px`,
    "--row-h": `${metrics.rowHeight}px`,
    "--gap": `${metrics.gap}px`,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      className={classes.board}
      data-editing={editing && wide ? true : undefined}
      style={{ height, ...gridLines }}
    >
      {landing && (
        <motion.div
          className={classes.placeholder}
          aria-hidden
          initial={false}
          animate={toBox(cellToPixels(landing, metrics))}
          transition={SPRINGS.snappy}
        />
      )}

      {refused && (
        <motion.div
          className={classes.refused}
          aria-hidden
          initial={false}
          animate={toBox(cellToPixels(refused, metrics))}
          transition={SPRINGS.snappy}
        >
          <Text size="xs" fw={600} className={classes.refusedLabel}>
            Can&apos;t place here
          </Text>
        </motion.div>
      )}

      {measured &&
        cells.map((item) => {
          const widget = WIDGETS[item.type];
          const Icon = widget.icon;
          const view = item.view ?? "chart";
          return (
            <GridCell
              key={item.type}
              item={item}
              metrics={metrics}
              followsPointer={drag.pointerType === item.type}
              raised={drag.activeType === item.type || drag.landingType === item.type}
            >
              {(values, size) => (
                <WidgetFrame
                  title={widget.title}
                  icon={<Icon size={16} color={COLORS.primary} />}
                  bare={widget.bare}
                  edit={editControls(item.type, values)}
                  active={drag.activeType === item.type}
                  blocked={drag.refused?.type === item.type}
                  atLimit={drag.atLimit === item.type}
                  actions={
                    widget.renderTable && (
                      <ViewToggle
                        view={view}
                        onChange={(next) => onChange(setWidgetView(layout, item.type, next))}
                      />
                    )
                  }
                >
                  <WidgetBody
                    type={item.type}
                    w={size.w}
                    h={size.h}
                    view={view}
                    stats={stats}
                    now={now}
                  />
                </WidgetFrame>
              )}
            </GridCell>
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

// Position by transform, so the outline glides between cells without layout work
const toBox = ({ left, top, width, height }: ReturnType<typeof cellToPixels>) => ({
  x: left,
  y: top,
  width,
  height,
});
