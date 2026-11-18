import {
  GRID_COLUMNS,
  GRID_DESKTOP_MIN_WIDTH,
  GRID_TABLET_MIN_WIDTH,
  PHONE_GRID_COLUMNS,
  TABLET_GRID_COLUMNS,
} from "@/features/stats/constants";
import type { LayoutItem } from "@/features/stats/types";

export type GridColumns =
  typeof GRID_COLUMNS | typeof TABLET_GRID_COLUMNS | typeof PHONE_GRID_COLUMNS;

export interface GridMetrics {
  cellWidth: number;
  rowHeight: number;
  gap: number;
}

interface PointerDelta extends GridMetrics {
  /** Pixels the pointer moved since it went down. */
  dx: number;
  dy: number;
  origin: LayoutItem;
}

// A step to the next cell covers the cell and the gap after it
const steps = (pixels: number, cell: number, gap: number) => Math.round(pixels / (cell + gap));

/** The cell a dragged widget's top-left corner points at; the engine clamps it to the grid. */
export const pointerToCell = ({ dx, dy, origin, cellWidth, rowHeight, gap }: PointerDelta) => ({
  x: origin.x + steps(dx, cellWidth, gap),
  y: origin.y + steps(dy, rowHeight, gap),
});

/** The size a widget is resized to by dragging its corner; the engine applies the limits. */
export const sizeFromDelta = ({ dx, dy, origin, cellWidth, rowHeight, gap }: PointerDelta) => ({
  w: origin.w + steps(dx, cellWidth, gap),
  h: origin.h + steps(dy, rowHeight, gap),
});

export const cellToPixels = (
  { x, y, w, h }: Pick<LayoutItem, "x" | "y" | "w" | "h">,
  { cellWidth, rowHeight, gap }: GridMetrics,
) => ({
  left: x * (cellWidth + gap),
  top: y * (rowHeight + gap),
  width: w * cellWidth + (w - 1) * gap,
  height: h * rowHeight + (h - 1) * gap,
});

export const cellWidthFor = (width: number, columns: number, gap: number) =>
  (width - gap * (columns - 1)) / columns;

export const columnsForWidth = (width: number): GridColumns => {
  if (width >= GRID_DESKTOP_MIN_WIDTH) return GRID_COLUMNS;
  if (width >= GRID_TABLET_MIN_WIDTH) return TABLET_GRID_COLUMNS;
  return PHONE_GRID_COLUMNS;
};

/** For screen readers: "Favorite genres, column 3, row 4, 6 by 5". */
export const describePosition = ({ x, y, w, h }: LayoutItem, title: string) =>
  `${title}, column ${x + 1}, row ${y + 1}, ${w} by ${h}`;
