import { describe, expect, it } from "vitest";
import {
  addRecentMovie,
  freshRecentMovies,
  toMovieSummary,
  type RecentMovie,
} from "@/entities/movie/lib/recently-viewed";
import type { Movie, MovieSummary } from "@/entities/movie/types";

const movie = (id: number): MovieSummary => ({
  id,
  title: `Movie ${id}`,
  poster_path: `/${id}.jpg`,
  release_date: "2024-01-01",
  vote_average: 7,
});

const NOW = Date.parse("2026-11-20T12:00:00Z");
const DAY = 24 * 60 * 60 * 1000;
const seen = (id: number, daysAgo = 0): RecentMovie => ({
  ...movie(id),
  viewedAt: NOW - daysAgo * DAY,
});

describe("addRecentMovie", () => {
  it("puts the new movie first", () => {
    expect(addRecentMovie([seen(1), seen(2)], movie(3), 10, NOW).map((m) => m.id)).toEqual([
      3, 1, 2,
    ]);
  });

  it("moves a movie viewed again to the front instead of duplicating it", () => {
    expect(addRecentMovie([seen(1), seen(2), seen(3)], movie(2), 10, NOW).map((m) => m.id)).toEqual(
      [2, 1, 3],
    );
  });

  it("keeps at most the limit, dropping the oldest", () => {
    expect(addRecentMovie([seen(1), seen(2)], movie(3), 2, NOW).map((m) => m.id)).toEqual([3, 1]);
  });
});

describe("addRecentMovie dates", () => {
  it("remembers when the movie was viewed", () => {
    expect(addRecentMovie([], movie(1), 10, NOW)).toEqual([{ ...movie(1), viewedAt: NOW }]);
  });
});

// TMDB's terms allow keeping data from TMDB for at most 6 months
describe("freshRecentMovies", () => {
  it("keeps movies viewed within 180 days", () => {
    expect(freshRecentMovies([seen(1), seen(2, 180)], NOW).map((m) => m.id)).toEqual([1, 2]);
  });

  it("drops movies viewed longer ago", () => {
    expect(freshRecentMovies([seen(1), seen(2, 181)], NOW).map((m) => m.id)).toEqual([1]);
  });

  it("drops entries saved before dates were kept", () => {
    expect(freshRecentMovies([movie(1) as RecentMovie, seen(2)], NOW).map((m) => m.id)).toEqual([
      2,
    ]);
  });
});

describe("toMovieSummary", () => {
  it("keeps only what a card shows", () => {
    const full = { ...movie(1), overview: "Long text", genre_ids: [1, 2], popularity: 9 } as Movie;
    expect(toMovieSummary(full)).toEqual(movie(1));
  });
});
