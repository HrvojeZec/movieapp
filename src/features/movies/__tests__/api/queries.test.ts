import { describe, expect, it } from "vitest";
import type { Movie, TMDBResponse } from "@/features/movies/types";
import { getNextPage, movieKeys } from "@/features/movies/api/queries";

const page = (current: number, totalPages: number): TMDBResponse<Movie> => ({
  page: current,
  total_pages: totalPages,
  total_results: totalPages * 20,
  results: [],
});

describe("getNextPage", () => {
  it("returns the next page while there are more", () => {
    expect(getNextPage(page(1, 3))).toBe(2);
  });

  it("stops at the last page", () => {
    expect(getNextPage(page(3, 3))).toBeUndefined();
  });

  it("stops at page 500 because TMDB serves no more, even if total_pages is higher", () => {
    expect(getNextPage(page(499, 9000))).toBe(500);
    expect(getNextPage(page(500, 9000))).toBeUndefined();
  });
});

describe("movieKeys", () => {
  it("nests every key under the same root so all movie data can be invalidated at once", () => {
    for (const key of [movieKeys.list("popular"), movieKeys.details(550), movieKeys.genres()]) {
      expect(key[0]).toBe("movies");
    }
  });

  it("includes filters in discover keys so different filters are cached separately", () => {
    expect(movieKeys.discover({ genre: 28 })).not.toEqual(movieKeys.discover({ genre: 35 }));
  });
});
