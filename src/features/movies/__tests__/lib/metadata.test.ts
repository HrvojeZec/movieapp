import { describe, expect, it } from "vitest";
import { buildMovieMetadata } from "@/features/movies/lib/metadata";
import type { MovieDetails } from "@/features/movies/types";

const movie = (overrides: Partial<MovieDetails> = {}) =>
  ({
    id: 550,
    title: "Fight Club",
    overview: "An insomniac office worker and a soap maker form an underground fight club.",
    poster_path: "/poster.jpg",
    release_date: "1999-10-15",
    ...overrides,
  }) as MovieDetails;

describe("buildMovieMetadata", () => {
  it("uses the title with the release year and the overview", () => {
    const metadata = buildMovieMetadata(movie());

    expect(metadata.title).toBe("Fight Club (1999)");
    expect(metadata.description).toBe(movie().overview);
  });

  it("uses the poster as the social preview image", () => {
    expect(buildMovieMetadata(movie()).openGraph?.images).toEqual([
      {
        url: "https://image.tmdb.org/t/p/w500/poster.jpg",
        width: 500,
        height: 750,
        alt: "Fight Club poster",
      },
    ]);
  });

  it("shortens long overviews for search results", () => {
    const description = buildMovieMetadata(movie({ overview: "word ".repeat(100) })).description;
    expect(description!.length).toBeLessThanOrEqual(160);
    expect(description).toMatch(/…$/);
  });

  it("leaves out what the movie doesn't have", () => {
    const metadata = buildMovieMetadata(
      movie({ release_date: "", overview: "", poster_path: null }),
    );

    expect(metadata.title).toBe("Fight Club");
    expect(metadata.description).toBeUndefined();
    expect(metadata.openGraph?.images).toBeUndefined();
  });
});
