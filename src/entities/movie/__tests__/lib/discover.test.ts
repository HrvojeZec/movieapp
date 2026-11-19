import { describe, expect, it } from "vitest";
import {
  buildDiscoverParams,
  hasAdvancedFilters,
  parseAdvancedFilters,
} from "@/entities/movie/lib/discover";

describe("buildDiscoverParams", () => {
  it("keeps the basic filters as before", () => {
    expect(buildDiscoverParams({ year: 2024, genre: 28, minRating: 7, page: 2 })).toEqual({
      page: 2,
      sort_by: "popularity.desc",
      primary_release_year: 2024,
      with_genres: "28",
      "vote_average.gte": 7,
    });
  });

  it("maps the advanced filters to TMDB's discover parameters", () => {
    expect(
      buildDiscoverParams({
        yearFrom: 1990,
        yearTo: 1999,
        genres: [18, 53],
        runtimeMin: 90,
        runtimeMax: 150,
        language: "fr",
        sortBy: "primary_release_date.desc",
        minVotes: 50,
      }),
    ).toEqual({
      page: 1,
      sort_by: "primary_release_date.desc",
      "primary_release_date.gte": "1990-01-01",
      "primary_release_date.lte": "1999-12-31",
      // A comma means all of the genres, as the filter promises
      with_genres: "18,53",
      "with_runtime.gte": 90,
      "with_runtime.lte": 150,
      with_original_language: "fr",
      "vote_count.gte": 50,
    });
  });

  it("joins the basic genre with the advanced ones, once each", () => {
    expect(buildDiscoverParams({ genre: 18, genres: [18, 53] }).with_genres).toBe("18,53");
  });

  it("sorting by rating needs some votes, or a single 10/10 vote wins", () => {
    expect(buildDiscoverParams({ sortBy: "vote_average.desc" })["vote_count.gte"]).toBe(200);
    expect(
      buildDiscoverParams({ sortBy: "vote_average.desc", minVotes: 0 })["vote_count.gte"],
    ).toBe(0);
  });
});

describe("parseAdvancedFilters", () => {
  it("reads the advanced filters from the URL", () => {
    const params = new URLSearchParams(
      "from=1990&to=1999&genres=18,53&runtimeMin=90&runtimeMax=150&lang=en&sort=title.asc&votes=100",
    );
    expect(parseAdvancedFilters(params)).toEqual({
      yearFrom: 1990,
      yearTo: 1999,
      genres: [18, 53],
      runtimeMin: 90,
      runtimeMax: 150,
      language: "en",
      sortBy: "title.asc",
      minVotes: 100,
    });
  });

  it("drops values a hand-edited URL got wrong instead of failing the page", () => {
    const params = new URLSearchParams("from=abc&genres=18,x&lang=english&sort=revenue.desc");
    expect(parseAdvancedFilters(params)).toEqual({ genres: [18] });
  });

  it("knows when any advanced filter is set", () => {
    expect(hasAdvancedFilters({})).toBe(false);
    expect(hasAdvancedFilters({ genres: [] })).toBe(false);
    expect(hasAdvancedFilters({ sortBy: "title.asc" })).toBe(true);
  });
});
