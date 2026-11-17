import { cache } from "react";
import { notFound } from "next/navigation";
import type { MovieDetails } from "@/features/movies/types";
import { movieIdSchema } from "@/features/movies/validations/movies.schema";
import { HTTP_STATUS } from "@/shared/lib/http-status";
import { fetchMovieDetails } from "./movies";
import { TmdbError } from "./tmdb";

interface MoviePageData {
  id: number;
  /** null when TMDB is unreachable: the page still renders and the client retries. */
  movie: MovieDetails | null;
}

/**
 * Loads the movie of /movie/[id] on the server. Unknown or malformed IDs respond with a real
 * 404 (good for search engines); other failures fall back to fetching in the browser.
 * Cached per request: the page and generateMetadata both call it.
 */
export const loadMoviePage = cache(async (rawId: string): Promise<MoviePageData> => {
  const parsed = movieIdSchema.safeParse(rawId);
  if (!parsed.success) notFound();

  try {
    return { id: parsed.data, movie: await fetchMovieDetails(parsed.data) };
  } catch (error) {
    if (error instanceof TmdbError && error.status === HTTP_STATUS.NOT_FOUND) notFound();
    console.error(`Server render of movie ${parsed.data} failed:`, error);
    return { id: parsed.data, movie: null };
  }
});
