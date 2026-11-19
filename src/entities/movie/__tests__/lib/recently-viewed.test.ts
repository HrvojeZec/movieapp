import { describe, expect, it } from "vitest";
import { addRecentMovie, toMovieSummary } from "@/entities/movie/lib/recently-viewed";
import type { Movie, MovieSummary } from "@/entities/movie/types";

const movie = (id: number): MovieSummary => ({
  id,
  title: `Movie ${id}`,
  poster_path: `/${id}.jpg`,
  release_date: "2024-01-01",
  vote_average: 7,
});

describe("addRecentMovie", () => {
  it("puts the new movie first", () => {
    expect(addRecentMovie([movie(1), movie(2)], movie(3), 10).map((m) => m.id)).toEqual([3, 1, 2]);
  });

  it("moves a movie viewed again to the front instead of duplicating it", () => {
    expect(addRecentMovie([movie(1), movie(2), movie(3)], movie(2), 10).map((m) => m.id)).toEqual([
      2, 1, 3,
    ]);
  });

  it("keeps at most the limit, dropping the oldest", () => {
    expect(addRecentMovie([movie(1), movie(2)], movie(3), 2).map((m) => m.id)).toEqual([3, 1]);
  });
});

describe("toMovieSummary", () => {
  it("keeps only what a card shows", () => {
    const full = { ...movie(1), overview: "Long text", genre_ids: [1, 2], popularity: 9 } as Movie;
    expect(toMovieSummary(full)).toEqual(movie(1));
  });
});
