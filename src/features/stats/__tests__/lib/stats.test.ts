import { describe, expect, it } from "vitest";
import { countTopGenres, groupByMonth } from "@/features/stats/lib/stats";

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
