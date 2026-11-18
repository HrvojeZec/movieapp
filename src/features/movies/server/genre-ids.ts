import { HTTP_STATUS } from "@/shared/lib/http-status";
import { fetchMovieDetails } from "./movies";
import { TmdbError } from "./tmdb";

/**
 * A movie's TMDB genre IDs, stored with activity for recommendations and stats. Null when TMDB
 * doesn't know the movie; empty when TMDB fails, since a missing genre shouldn't block the user.
 */
export async function fetchGenreIds(movieId: string): Promise<number[] | null> {
  try {
    const movie = await fetchMovieDetails(Number(movieId));
    return movie.genres.map((genre) => genre.id);
  } catch (error) {
    if (error instanceof TmdbError && error.status === HTTP_STATUS.NOT_FOUND) return null;
    console.error(`Could not load the genres of movie ${movieId}:`, error);
    return [];
  }
}
