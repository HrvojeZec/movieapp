import type { Movie } from "@/features/movies/types";

// TMDB reports 0 for movies nobody has rated yet (often unreleased ones), not a real score of 0
export const hasRating = (voteAverage: number): boolean => voteAverage > 0;

export const formatRating = (voteAverage: number): string =>
  hasRating(voteAverage) ? voteAverage.toFixed(1) : "Not rated";

/** TMDB can return the same movie on two pages when popularity shifts between requests. */
export function dedupeMovies(pages: { results: Movie[] }[]): Movie[] {
  const unique = new Map<number, Movie>();
  pages.forEach((page) => page.results.forEach((movie) => unique.set(movie.id, movie)));
  return [...unique.values()];
}
