import { describe, expect, it } from "vitest";
import { dedupeMovies, formatRating, hasRating } from "@/features/movies/lib/movies";
import type { Movie } from "@/features/movies/types";

const movie = (id: number, title = `Movie ${id}`) => ({ id, title }) as Movie;

describe("formatRating", () => {
  it.each([
    [7.654, "7.7"],
    [8, "8.0"],
    [0.04, "0.0"],
  ])("formats %d as %s", (vote, expected) => {
    expect(formatRating(vote)).toBe(expected);
  });

  it("says Not rated instead of 0.0 for movies nobody has rated", () => {
    expect(hasRating(0)).toBe(false);
    expect(formatRating(0)).toBe("Not rated");
  });
});

describe("dedupeMovies", () => {
  it("flattens pages and keeps each movie once, in order of first appearance", () => {
    const pages = [{ results: [movie(1), movie(2)] }, { results: [movie(2), movie(3)] }];
    expect(dedupeMovies(pages).map((m) => m.id)).toEqual([1, 2, 3]);
  });

  it("returns an empty list without pages", () => {
    expect(dedupeMovies([])).toEqual([]);
  });
});
