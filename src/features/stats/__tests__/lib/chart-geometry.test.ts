import { describe, expect, it } from "vitest";
import {
  donutArcs,
  heatmapWeeks,
  linePath,
  monthlyActivity,
  topWithOther,
} from "@/features/stats/lib/chart-geometry";

const RING = { radius: 50, thickness: 12, gapDegrees: 2 };

describe("donutArcs", () => {
  it("donut arcs cover the circle minus the gaps", () => {
    const arcs = donutArcs([3, 1], RING);
    expect(arcs.map(({ index, startAngle, endAngle }) => [index, startAngle, endAngle])).toEqual([
      [0, 1, 268],
      [1, 270, 359],
    ]);
    const covered = arcs.reduce((sum, arc) => sum + arc.endAngle - arc.startAngle, 0);
    expect(covered).toBe(360 - 2 * RING.gapDegrees);
    expect(arcs.every((arc) => arc.path.startsWith("M") && arc.path.endsWith("Z"))).toBe(true);
  });

  it("a zero value draws no arc", () => {
    expect(donutArcs([2, 0, 2], RING).map((arc) => arc.index)).toEqual([0, 2]);
    expect(donutArcs([0, 0], RING)).toEqual([]);
  });

  it("a single value is a whole ring without a gap", () => {
    const [arc] = donutArcs([5], RING);
    expect([arc.startAngle, arc.endAngle]).toEqual([0, 360]);
  });
});

describe("linePath", () => {
  it("scales the line to the highest value", () => {
    expect(linePath([0, 5, 10], 100, 50)).toEqual({
      line: "M0 50 L50 25 L100 0",
      area: "M0 50 L50 25 L100 0 L100 50 L0 50 Z",
    });
  });

  it("a flat series draws a line along the bottom", () => {
    expect(linePath([0, 0, 0], 100, 50).line).toBe("M0 50 L50 50 L100 50");
  });

  it("draws nothing without points", () => {
    expect(linePath([], 100, 50)).toEqual({ line: "", area: "" });
  });
});

describe("heatmapWeeks", () => {
  // A Wednesday
  const NOW = new Date("2026-11-18T09:00:00Z");

  it("the heatmap has 53 weeks of 7 days ending today", () => {
    const weeks = heatmapWeeks([], NOW);
    expect(weeks).toHaveLength(53);
    expect(weeks.every((week) => week.length === 7)).toBe(true);
    // Weeks start on Monday (UTC)
    expect(weeks[0][0].date).toBe("2025-11-17");
    expect(weeks[52][2]).toMatchObject({ date: "2026-11-18", future: false });
    expect(weeks[52][3]).toMatchObject({ date: "2026-11-19", future: true });
  });

  it("counts watched movies and page views per day", () => {
    const weeks = heatmapWeeks([{ date: "2026-11-17", watched: 1, views: 2 }], NOW);
    expect(weeks[52][1]).toMatchObject({ date: "2026-11-17", count: 3, level: 4 });
    expect(weeks[52][0]).toMatchObject({ count: 0, level: 0 });
  });

  it("levels split non-zero days into quartiles", () => {
    const days = [1, 2, 3, 4, 5, 6, 7, 8].map((views, index) => ({
      date: `2026-11-0${index + 1}`,
      watched: 0,
      views,
    }));
    const levels = heatmapWeeks(days, NOW)
      .flat()
      .filter((cell) => cell.count > 0)
      .map((cell) => cell.level);
    expect(levels).toEqual([1, 1, 2, 2, 3, 3, 4, 4]);
  });
});

describe("topWithOther", () => {
  const genre = (name: string, count: number) => ({ id: count, name, count });

  it("groups the rest into Other", () => {
    expect(
      topWithOther(
        [
          genre("Drama", 9),
          genre("Crime", 7),
          genre("Comedy", 3),
          genre("War", 2),
          genre("Western", 1),
        ],
        3,
      ),
    ).toEqual([
      { label: "Drama", count: 9 },
      { label: "Crime", count: 7 },
      { label: "Comedy", count: 3 },
      { label: "Other", count: 3 },
    ]);
  });

  it("leaves Other out when nothing is left over", () => {
    expect(topWithOther([genre("Drama", 2)], 5)).toEqual([{ label: "Drama", count: 2 }]);
  });
});

describe("monthlyActivity", () => {
  it("sums active days and activity per month, newest first", () => {
    expect(
      monthlyActivity([
        { date: "2026-10-03", watched: 1, views: 0 },
        { date: "2026-11-17", watched: 1, views: 2 },
        { date: "2026-11-18", watched: 0, views: 1 },
      ]),
    ).toEqual([
      { month: "2026-11", activeDays: 2, activities: 4 },
      { month: "2026-10", activeDays: 1, activities: 1 },
    ]);
    expect(monthlyActivity([])).toEqual([]);
  });
});
