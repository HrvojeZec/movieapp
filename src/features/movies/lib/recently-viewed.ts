import type { MovieSummary } from "@/features/movies/types";

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
  movies: MovieSummary[],
  movie: MovieSummary,
  limit: number,
): MovieSummary[] {
  return [toMovieSummary(movie), ...movies.filter((recent) => recent.id !== movie.id)].slice(
    0,
    limit,
  );
}
