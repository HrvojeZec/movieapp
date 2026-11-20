import { TMDB_DATA_MAX_AGE_DAYS } from "@/entities/movie/constants";
import type { MovieSummary } from "@/entities/movie/types";
import { DAY_MS } from "@/shared/lib/time";

/** A movie in the recently viewed list, with when it was last opened (ms). */
export type RecentMovie = MovieSummary & { viewedAt: number };

/** Only the fields a card shows, so a full TMDB response doesn't end up in localStorage. */
export const toMovieSummary = ({
  id,
  title,
  poster_path,
  release_date,
  vote_average,
}: MovieSummary): MovieSummary => ({ id, title, poster_path, release_date, vote_average });

/** Puts the movie first, without duplicates, keeping at most `limit` movies. */
export function addRecentMovie(
  movies: RecentMovie[],
  movie: MovieSummary,
  limit: number,
  now: number,
): RecentMovie[] {
  return [
    { ...toMovieSummary(movie), viewedAt: now },
    ...movies.filter((recent) => recent.id !== movie.id),
  ].slice(0, limit);
}

/**
 * The movies viewed within TMDB's 6-month limit for keeping its data; entries without a date
 * (saved by an older version) go too, since their age is unknown.
 */
export function freshRecentMovies(movies: RecentMovie[], now: number): RecentMovie[] {
  const oldest = now - TMDB_DATA_MAX_AGE_DAYS * DAY_MS;
  return movies.filter((movie) => typeof movie.viewedAt === "number" && movie.viewedAt >= oldest);
}
