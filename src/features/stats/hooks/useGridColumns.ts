import { useElementSize } from "@mantine/hooks";
import { GRID_GAP, GRID_ROW_HEIGHT } from "@/features/stats/constants";
import { cellWidthFor, columnsForWidth, type GridMetrics } from "@/features/stats/lib/grid-drag";

/** Measures the board: its column count follows its own width, not the window's. */
export function useGridColumns() {
  const { ref, width } = useElementSize<HTMLDivElement>();
  const columns = columnsForWidth(width);
  const metrics: GridMetrics = {
    cellWidth: cellWidthFor(width, columns, GRID_GAP),
    rowHeight: GRID_ROW_HEIGHT,
    gap: GRID_GAP,
  };
  return { ref, measured: width > 0, columns, metrics };
}
