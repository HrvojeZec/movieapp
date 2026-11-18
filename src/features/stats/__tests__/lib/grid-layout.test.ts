import { describe, expect, it } from "vitest";
import {
  DEFAULT_LAYOUT,
  GRID_COLUMNS,
  WIDGET_SIZES,
  WIDGET_TYPES,
} from "@/features/stats/constants";
import {
  addWidget,
  compact,
  hasOverlap,
  moveWidget,
  removeWidget,
  reorderWidget,
  resizeWidget,
  sanitizeLayout,
  stepWidget,
  toColumns,
} from "@/features/stats/lib/grid-layout";
import type { LayoutItem, WidgetType } from "@/features/stats/types";

const byType = (type: WidgetType) => (item: LayoutItem) => item.type === type;

const freeze = (layout: LayoutItem[]): LayoutItem[] =>
  Object.freeze(layout.map((item) => Object.freeze({ ...item }))) as LayoutItem[];

// The engine is tested on a fixed board, so changing the default board doesn't move these tests
const BOARD: LayoutItem[] = [
  { type: "tileWatched", x: 0, y: 0, w: 3, h: 2 },
  { type: "tileFavorites", x: 3, y: 0, w: 3, h: 2 },
  { type: "tileWatchlist", x: 6, y: 0, w: 3, h: 2 },
  { type: "tileLists", x: 9, y: 0, w: 3, h: 2 },
  { type: "genreBars", x: 0, y: 2, w: 6, h: 5 },
  { type: "watchedMonthly", x: 6, y: 2, w: 6, h: 5 },
  { type: "viewsTrend", x: 0, y: 7, w: 12, h: 5 },
];

const bottom = (layout: LayoutItem[]) => Math.max(0, ...layout.map((item) => item.y + item.h));

describe("DEFAULT_LAYOUT", () => {
  it("has one of every widget, packed, in the grid and within each widget's size limits", () => {
    expect(DEFAULT_LAYOUT.map((item) => item.type).sort()).toEqual([...WIDGET_TYPES].sort());
    expect(compact(DEFAULT_LAYOUT)).toEqual(DEFAULT_LAYOUT);
    expect(hasOverlap(DEFAULT_LAYOUT)).toBe(false);
    for (const item of DEFAULT_LAYOUT) {
      const { min, max } = WIDGET_SIZES[item.type];
      expect(item.x + item.w).toBeLessThanOrEqual(GRID_COLUMNS);
      expect(item.w).toBeGreaterThanOrEqual(min[0]);
      expect(item.w).toBeLessThanOrEqual(max[0]);
      expect(item.h).toBeGreaterThanOrEqual(min[1]);
      expect(item.h).toBeLessThanOrEqual(max[1]);
    }
  });
});

describe("hasOverlap", () => {
  it("detects intersecting widgets but not touching ones", () => {
    const touching: LayoutItem[] = [
      { type: "tileWatched", x: 0, y: 0, w: 3, h: 2 },
      { type: "tileFavorites", x: 3, y: 0, w: 3, h: 2 },
      { type: "genreBars", x: 0, y: 2, w: 6, h: 5 },
    ];
    expect(hasOverlap(touching)).toBe(false);
    expect(hasOverlap([...touching, { type: "tileLists", x: 5, y: 1, w: 2, h: 2 }])).toBe(true);
  });
});

describe("compact", () => {
  it("compacts widgets upwards without overlaps", () => {
    const result = compact([
      { type: "genreBars", x: 0, y: 4, w: 6, h: 5 },
      { type: "tileWatched", x: 0, y: 0, w: 3, h: 2 },
    ]);
    expect(result).toEqual([
      { type: "tileWatched", x: 0, y: 0, w: 3, h: 2 },
      { type: "genreBars", x: 0, y: 2, w: 6, h: 5 },
    ]);
  });

  it("does not let a widget jump over another one in its columns", () => {
    const result = compact([
      { type: "tileWatched", x: 0, y: 0, w: 3, h: 2 },
      { type: "genreBars", x: 0, y: 5, w: 6, h: 5 },
      { type: "tileFavorites", x: 0, y: 20, w: 3, h: 2 },
    ]);
    expect(result.map((item) => [item.type, item.y])).toEqual([
      ["tileWatched", 0],
      ["genreBars", 2],
      ["tileFavorites", 7],
    ]);
  });
});

describe("moveWidget", () => {
  it("moving a widget onto another pushes it down", () => {
    const moved = moveWidget(BOARD, "genreBars", 6, 2);
    expect(moved.find(byType("genreBars"))).toMatchObject({ x: 6, y: 2 });
    expect(moved.find(byType("watchedMonthly"))!.y).toBeGreaterThanOrEqual(7);
    expect(hasOverlap(moved)).toBe(false);
  });

  it("moves are clamped to the grid", () => {
    expect(moveWidget(BOARD, "tileWatched", 11, -3).find(byType("tileWatched"))).toMatchObject({
      x: 9,
      y: 0,
    });
    expect(hasOverlap(moveWidget(BOARD, "tileWatched", 11, -3))).toBe(false);
  });

  it("a widget moved into empty space below falls back up", () => {
    const moved = moveWidget(BOARD, "tileWatched", 0, 40);
    expect(moved.find(byType("tileWatched"))!.y).toBe(bottom(BOARD));
  });

  it("moving a widget that is not on the board changes nothing", () => {
    const layout = removeWidget(BOARD, "viewsTrend");
    expect(moveWidget(layout, "viewsTrend", 0, 0)).toEqual(layout);
  });
});

describe("resizeWidget", () => {
  it("resizes respect min, max and the right edge", () => {
    const big = resizeWidget(BOARD, "tileLists", 9, 9).find(byType("tileLists"))!;
    expect([big.w, big.h]).toEqual([3, 3]); // x=9 leaves 3 columns; tile max h is 3
    const small = resizeWidget(BOARD, "genreBars", 1, 1).find(byType("genreBars"))!;
    expect([small.w, small.h]).toEqual([4, 4]);
  });

  it("growing a widget pushes its neighbours down", () => {
    const resized = resizeWidget(BOARD, "genreBars", 8, 5);
    expect(resized.find(byType("genreBars"))).toMatchObject({ x: 0, y: 2, w: 8, h: 5 });
    expect(resized.find(byType("watchedMonthly"))!.y).toBeGreaterThanOrEqual(7);
    expect(hasOverlap(resized)).toBe(false);
  });
});

describe("addWidget", () => {
  it("adds a widget in the first free spot with its default size", () => {
    const layout = removeWidget(BOARD, "tileLists");
    const added = addWidget(layout, "tileLists");
    expect(added.find(byType("tileLists"))).toEqual({ type: "tileLists", x: 9, y: 0, w: 3, h: 2 });
    expect(hasOverlap(added)).toBe(false);
  });

  it("adds a widget at the bottom when there is no room higher up", () => {
    const layout = removeWidget(BOARD, "viewsTrend");
    const added = addWidget(layout, "viewsTrend");
    const [w, h] = WIDGET_SIZES.viewsTrend.default;
    expect(added.find(byType("viewsTrend"))).toEqual({
      type: "viewsTrend",
      x: 0,
      y: bottom(layout),
      w,
      h,
    });
  });

  it("adding a widget already on the board changes nothing", () => {
    expect(addWidget(BOARD, "genreBars")).toEqual(compact(BOARD));
  });
});

describe("removeWidget", () => {
  it("removing a widget lets the others rise", () => {
    const removed = removeWidget(BOARD, "genreBars");
    expect(removed.some(byType("genreBars"))).toBe(false);
    expect(removed.find(byType("viewsTrend"))!.y).toBe(7); // still under watchedMonthly
    const noMonthly = removeWidget(removed, "watchedMonthly");
    expect(noMonthly.find(byType("viewsTrend"))!.y).toBe(2);
  });
});

describe("toColumns", () => {
  it("toColumns halves the grid for tablets and stacks for phones", () => {
    // Both edges are halved and rounded the same way, so neighbours stay side by side
    const tablet = toColumns(BOARD, 6);
    expect(tablet.filter((item) => item.type.startsWith("tile"))).toEqual([
      { type: "tileWatched", x: 0, y: 0, w: 2, h: 2 },
      { type: "tileFavorites", x: 2, y: 0, w: 1, h: 2 },
      { type: "tileWatchlist", x: 3, y: 0, w: 2, h: 2 },
      { type: "tileLists", x: 5, y: 0, w: 1, h: 2 },
    ]);
    expect(tablet.find(byType("genreBars"))).toMatchObject({ x: 0, y: 2, w: 3 });
    expect(tablet.find(byType("watchedMonthly"))).toMatchObject({ x: 3, y: 2, w: 3 });
    expect(tablet.find(byType("viewsTrend"))).toMatchObject({ x: 0, y: 7, w: 6 });
    expect(tablet.every((item) => item.x + item.w <= 6)).toBe(true);
    expect(hasOverlap(tablet)).toBe(false);

    const phone = toColumns(BOARD, 1);
    expect(phone.map((item) => item.type)).toEqual([
      "tileWatched",
      "tileFavorites",
      "tileWatchlist",
      "tileLists",
      "genreBars",
      "watchedMonthly",
      "viewsTrend",
    ]);
    expect(phone.every((item) => item.x === 0 && item.w === 1)).toBe(true);
    expect(phone.map((item) => item.y)).toEqual([0, 2, 4, 6, 8, 13, 18]);
  });

  it("keeps a full-width tablet widget inside six columns", () => {
    const tablet = toColumns([{ type: "tileWatched", x: 11, y: 0, w: 1, h: 2 }], 6);
    expect(tablet[0]).toMatchObject({ x: 5, w: 1 });
  });
});

describe("sanitizeLayout", () => {
  it("sanitizeLayout repairs a stale layout", () => {
    const repaired = sanitizeLayout([
      { type: "tileWatched", x: 0, y: 0, w: 3, h: 2 },
      { type: "tileWatched", x: 3, y: 0, w: 3, h: 2 },
      { type: "unknownWidget" as WidgetType, x: 0, y: 0, w: 2, h: 2 },
      { type: "genreBars", x: 10, y: 0, w: 20, h: 1 },
    ]);
    expect(repaired.map((item) => item.type)).toEqual(["tileWatched", "genreBars"]);
    expect(repaired[1]).toMatchObject({ w: 12, h: 4, x: 0 });
    expect(hasOverlap(repaired)).toBe(false);
  });

  it("replaces numbers that are not whole or finite", () => {
    const repaired = sanitizeLayout([
      { type: "tileWatched", x: Number.NaN, y: -5, w: 2.6, h: Number.POSITIVE_INFINITY },
    ]);
    expect(repaired).toEqual([{ type: "tileWatched", x: 0, y: 0, w: 3, h: 2 }]);
  });
});

describe("far-away positions", () => {
  // A saved or submitted y can be any non-negative integer; packing must not walk to it row by row
  it("settles widgets placed far below the grid without walking every row", () => {
    const far = 1e9;
    const repaired = sanitizeLayout([
      { type: "tileWatched", x: 0, y: far, w: 3, h: 2 },
      { type: "genreBars", x: 0, y: far, w: 6, h: 5 },
    ]);
    expect(repaired.map((item) => item.y)).toEqual([0, 2]);
    expect(moveWidget(BOARD, "tileWatched", 0, far).find(byType("tileWatched"))!.y).toBe(12);
    expect(
      addWidget([{ type: "tileWatched", x: 0, y: far, w: 3, h: 2 }], "genreBars").map((i) => i.y),
    ).toEqual([0, 0]);
  }, 1000);
});

describe("stepWidget", () => {
  const position = (layout: LayoutItem[], type: WidgetType) => {
    const { x, y } = layout.find(byType(type))!;
    return { x, y };
  };

  it("moving down jumps below the widget underneath", () => {
    // One row down would just fall back up into the empty cell, so the step goes past genreBars
    const moved = stepWidget(BOARD, "tileWatched", "down");
    expect(position(moved, "tileWatched")).toEqual({ x: 0, y: 7 });
    expect(hasOverlap(moved)).toBe(false);
  });

  it("moving up rises above the widget overhead", () => {
    const moved = stepWidget(BOARD, "genreBars", "up");
    expect(position(moved, "genreBars")).toEqual({ x: 0, y: 0 });
    expect(position(moved, "tileWatched").y).toBeGreaterThanOrEqual(5);
  });

  it("moves sideways one column", () => {
    const moved = stepWidget(BOARD, "tileWatched", "right");
    expect(position(moved, "tileWatched")).toEqual({ x: 1, y: 0 });
    expect(hasOverlap(moved)).toBe(false);
  });

  it("at the edge of the grid nothing changes", () => {
    expect(stepWidget(BOARD, "tileLists", "right")).toEqual(compact(BOARD));
    expect(stepWidget(BOARD, "tileWatched", "up")).toEqual(compact(BOARD));
  });
});

describe("reorderWidget", () => {
  const readingOrder = (layout: LayoutItem[]) => toColumns(layout, 1).map((item) => item.type);

  it("swaps a widget with its neighbour in reading order", () => {
    const moved = reorderWidget(BOARD, "genreBars", -1);
    expect(readingOrder(moved)).toEqual([
      "tileWatched",
      "tileFavorites",
      "tileWatchlist",
      "genreBars",
      "tileLists",
      "watchedMonthly",
      "viewsTrend",
    ]);
    expect(hasOverlap(moved)).toBe(false);
    // Packing on save keeps that order
    expect(readingOrder(compact(moved))).toEqual(readingOrder(moved));
  });

  it("keeps sizes and lays the default board out as it was", () => {
    const there = reorderWidget(BOARD, "tileFavorites", -1);
    expect(reorderWidget(there, "tileFavorites", 1)).toEqual(compact(BOARD));
  });

  it("the first widget can't go up and the last can't go down", () => {
    expect(reorderWidget(BOARD, "tileWatched", -1)).toEqual(compact(BOARD));
    expect(reorderWidget(BOARD, "viewsTrend", 1)).toEqual(compact(BOARD));
  });
});

describe("immutability", () => {
  it("never mutates its input", () => {
    const layout = freeze(BOARD);
    const snapshot = structuredClone(BOARD);
    expect(() => {
      compact(layout);
      moveWidget(layout, "genreBars", 6, 2);
      resizeWidget(layout, "genreBars", 8, 6);
      addWidget(freeze(removeWidget(layout, "tileLists")), "tileLists");
      removeWidget(layout, "genreBars");
      stepWidget(layout, "tileWatched", "down");
      reorderWidget(layout, "genreBars", -1);
      toColumns(layout, 6);
      toColumns(layout, 1);
      sanitizeLayout(layout);
      hasOverlap(layout);
    }).not.toThrow();
    expect(BOARD).toEqual(snapshot);
  });
});
