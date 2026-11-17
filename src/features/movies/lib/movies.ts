import type { Movie } from "@/features/movies/types";

export const formatRating = (voteAverage: number): string => voteAverage.toFixed(1);

/** TMDB can return the same movie on two pages when popularity shifts between requests. */
export function dedupeMovies(pages: { results: Movie[] }[]): Movie[] {
  const unique = new Map<number, Movie>();
  pages.forEach((page) => page.results.forEach((movie) => unique.set(movie.id, movie)));
  return [...unique.values()];
}
