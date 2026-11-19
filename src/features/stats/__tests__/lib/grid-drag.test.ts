import { describe, expect, it } from "vitest";
import {
  cellToPixels,
  cellWidthFor,
  clampFrameSize,
  rubberBand,
  columnsForWidth,
  describePosition,
  pointerToCell,
  sizeFromDelta,
} from "@/features/stats/lib/grid-drag";

const GRID = { cellWidth: 60, rowHeight: 72, gap: 16 };
const origin = { type: "genreBars" as const, x: 2, y: 3, w: 6, h: 5 };

describe("pointerToCell", () => {
  it("rounds to the nearest cell", () => {
    // One column step is 60 + 16 = 76px, one row step 72 + 16 = 88px
    expect(pointerToCell({ dx: 37, dy: 43, origin, ...GRID })).toEqual({ x: 2, y: 3 });
    expect(pointerToCell({ dx: 39, dy: 45, origin, ...GRID })).toEqual({ x: 3, y: 4 });
    expect(pointerToCell({ dx: -160, dy: -270, origin, ...GRID })).toEqual({ x: 0, y: 0 });
  });

  it("accounts for the gap", () => {
    expect(pointerToCell({ dx: 76 * 3, dy: 88 * 2, origin, ...GRID })).toEqual({ x: 5, y: 5 });
  });
});

describe("sizeFromDelta", () => {
  it("grows and shrinks by whole cells", () => {
    expect(sizeFromDelta({ dx: 76 * 2 + 10, dy: -88, origin, ...GRID })).toEqual({ w: 8, h: 4 });
  });
});

describe("cellToPixels", () => {
  it("places a widget by its cells, gaps between cells included in its size", () => {
    expect(cellToPixels(origin, GRID)).toEqual({
      left: 2 * 76,
      top: 3 * 88,
      width: 6 * 60 + 5 * 16,
      height: 5 * 72 + 4 * 16,
    });
  });
});

describe("cellWidthFor", () => {
  it("splits the width into columns between the gaps", () => {
    expect(cellWidthFor(12 * 60 + 11 * 16, 12, 16)).toBe(60);
    expect(cellWidthFor(300, 1, 16)).toBe(300);
  });
});

describe("columnsForWidth", () => {
  it("uses 12 columns on wide boards, 6 on medium ones and 1 on narrow ones", () => {
    expect(columnsForWidth(1100)).toBe(12);
    expect(columnsForWidth(900)).toBe(12);
    expect(columnsForWidth(899)).toBe(6);
    expect(columnsForWidth(600)).toBe(6);
    expect(columnsForWidth(599)).toBe(1);
  });
});

describe("describePosition", () => {
  it("reads the position out in words, counting from one", () => {
    expect(describePosition(origin, "Favorite genres")).toBe(
      "Favorite genres, column 3, row 4, 6 by 5",
    );
  });
});

describe("clampFrameSize", () => {
  // genreBars: min 4×4, max 12×8
  const bars = { type: "genreBars" as const, x: 2, y: 0, w: 6, h: 5 };

  it("the frame follows the pointer between the limits", () => {
    expect(clampFrameSize(bars, { width: 500, height: 450 }, GRID)).toEqual({
      width: 500,
      height: 450,
    });
  });

  it("the frame stops at the widget's minimum", () => {
    expect(clampFrameSize(bars, { width: 10, height: 10 }, GRID)).toEqual({
      width: 4 * 60 + 3 * 16,
      height: 4 * 72 + 3 * 16,
    });
  });

  it("the frame stops at the grid's right edge", () => {
    // x=2 leaves 10 columns
    expect(clampFrameSize(bars, { width: 5000, height: 450 }, GRID).width).toBe(10 * 60 + 9 * 16);
  });

  it("the frame stops at the widget's maximum height", () => {
    expect(clampFrameSize(bars, { width: 500, height: 5000 }, GRID).height).toBe(8 * 72 + 7 * 16);
  });
});

describe("rubberBand", () => {
  it("follows the pointer exactly inside the limit", () => {
    expect(rubberBand(300, 300)).toBe(300);
  });

  it("gives a little past the limit, less the further it is pulled", () => {
    const near = rubberBand(320, 300) - 300;
    const far = rubberBand(600, 300) - 300;
    expect(near).toBeGreaterThan(0);
    expect(near).toBeLessThan(20);
    expect(far).toBeGreaterThan(near);
    expect(far).toBeLessThanOrEqual(24);
  });

  it("works the same way below a minimum", () => {
    expect(rubberBand(250, 300)).toBeLessThan(300);
    expect(rubberBand(250, 300)).toBeGreaterThanOrEqual(276);
  });
});
