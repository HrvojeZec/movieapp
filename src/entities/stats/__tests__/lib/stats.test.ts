import { describe, expect, it } from "vitest";
import {
  computeStreak,
  countTopGenres,
  groupByDay,
  groupByMonth,
  statsDayWindowStart,
} from "@/entities/stats/lib/stats";

const DRAMA = 18;
const THRILLER = 53;
const COMEDY = 35;
const names = new Map([
  [DRAMA, "Drama"],
  [THRILLER, "Thriller"],
  [COMEDY, "Comedy"],
]);

describe("countTopGenres", () => {
  it("counts top genres across watched and favorites", () => {
    expect(
      countTopGenres(
        [
          { movieId: "550", genreIds: [DRAMA, THRILLER] },
          { movieId: "680", genreIds: [THRILLER] },
          { movieId: "13", genreIds: [COMEDY, DRAMA] },
          { movieId: "807", genreIds: [THRILLER] },
        ],
        names,
      ),
    ).toEqual([
      { id: THRILLER, name: "Thriller", count: 3 },
      { id: DRAMA, name: "Drama", count: 2 },
      { id: COMEDY, name: "Comedy", count: 1 },
    ]);
  });

  it("counts a movie that is both watched and a favorite once", () => {
    expect(
      countTopGenres(
        [
          { movieId: "550", genreIds: [DRAMA] },
          { movieId: "550", genreIds: [DRAMA] },
        ],
        names,
      ),
    ).toEqual([{ id: DRAMA, name: "Drama", count: 1 }]);
  });

  it("keeps the top ones, ties by name, and skips genres without a name", () => {
    expect(
      countTopGenres(
        [
          { movieId: "1", genreIds: [THRILLER, COMEDY, 9999] },
          { movieId: "2", genreIds: [DRAMA] },
        ],
        names,
        2,
      ),
    ).toEqual([
      { id: COMEDY, name: "Comedy", count: 1 },
      { id: DRAMA, name: "Drama", count: 1 },
    ]);
  });
});

describe("groupByMonth", () => {
  const NOW = new Date("2026-11-18T12:00:00Z");

  it("groups activity by month and fills empty months", () => {
    const months = groupByMonth(
      [
        { kind: "watched", at: new Date("2026-11-02T10:00:00Z") },
        { kind: "watched", at: new Date("2026-11-17T10:00:00Z") },
        { kind: "views", at: new Date("2026-11-03T10:00:00Z") },
        { kind: "views", at: new Date("2026-09-30T23:00:00Z") },
      ],
      NOW,
    );

    expect(months).toHaveLength(12);
    expect(months[0]).toEqual({ month: "2025-12", watched: 0, views: 0 });
    expect(months.at(-1)).toEqual({ month: "2026-11", watched: 2, views: 1 });
    expect(months.find((month) => month.month === "2026-09")).toEqual({
      month: "2026-09",
      watched: 0,
      views: 1,
    });
    expect(months.find((month) => month.month === "2026-10")).toEqual({
      month: "2026-10",
      watched: 0,
      views: 0,
    });
  });

  it("ignores activity older than the window", () => {
    const months = groupByMonth([{ kind: "watched", at: new Date("2025-11-30T10:00:00Z") }], NOW);

    expect(months.every((month) => month.watched === 0)).toBe(true);
  });

  it("starts at the first month of the window", () => {
    expect(groupByMonth([], new Date("2026-01-05T00:00:00Z"), 3).map((m) => m.month)).toEqual([
      "2025-11",
      "2025-12",
      "2026-01",
    ]);
  });
});

describe("groupByDay", () => {
  const NOW = new Date("2026-11-18T09:00:00Z");

  it("groups activity by day in UTC", () => {
    expect(
      groupByDay(
        [
          { kind: "views", at: new Date("2026-11-18T08:00:00Z") },
          { kind: "watched", at: new Date("2026-11-17T23:30:00Z") },
          { kind: "views", at: new Date("2026-11-17T00:10:00Z") },
          { kind: "views", at: new Date("2026-11-17T12:00:00Z") },
          { kind: "watched", at: new Date("2026-01-03T12:00:00Z") },
        ],
        NOW,
      ),
    ).toEqual([
      { date: "2026-01-03", watched: 1, views: 0 },
      { date: "2026-11-17", watched: 1, views: 2 },
      { date: "2026-11-18", watched: 0, views: 1 },
    ]);
  });

  it("leaves out days before the window", () => {
    const result = groupByDay(
      [
        { kind: "views", at: new Date("2025-11-19T00:00:00Z") },
        { kind: "views", at: new Date("2025-11-18T23:59:59Z") },
      ],
      NOW,
    );
    expect(result).toEqual([{ date: "2025-11-19", watched: 0, views: 1 }]);
    expect(statsDayWindowStart(NOW)).toEqual(new Date("2025-11-19T00:00:00Z"));
  });
});

describe("computeStreak", () => {
  const NOW = new Date("2026-11-18T09:00:00Z");

  it("computes the current and longest streak", () => {
    expect(
      computeStreak(
        [
          "2026-11-01",
          "2026-11-02",
          "2026-11-03",
          "2026-11-04",
          "2026-11-16",
          "2026-11-17",
          "2026-11-18",
        ],
        NOW,
      ),
    ).toEqual({ current: 3, longest: 4 });
  });

  it("a streak still counts when today has no activity yet", () => {
    expect(computeStreak(["2026-11-16", "2026-11-17"], NOW)).toEqual({ current: 2, longest: 2 });
  });

  it("a gap of one day ends the streak", () => {
    expect(computeStreak(["2026-11-14", "2026-11-15", "2026-11-16"], NOW)).toEqual({
      current: 0,
      longest: 3,
    });
  });

  it("counts each day once, in any order", () => {
    expect(computeStreak(["2026-11-18", "2026-11-17", "2026-11-18"], NOW)).toEqual({
      current: 2,
      longest: 2,
    });
    expect(computeStreak([], NOW)).toEqual({ current: 0, longest: 0 });
  });

  it("follows days across month and year boundaries", () => {
    expect(computeStreak(["2025-12-31", "2026-01-01"], new Date("2026-01-01T05:00:00Z"))).toEqual({
      current: 2,
      longest: 2,
    });
  });
});
