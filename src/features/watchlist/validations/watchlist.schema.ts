import { z } from "zod";
import { INVALID_MOVIE_ID, movieIdStringSchema } from "@/features/movies/validations/movies.schema";

// The same TMDB movie IDs as favorites
export const watchlistMovieIdSchema = movieIdStringSchema;
export { INVALID_MOVIE_ID };

export const addToWatchlistSchema = z.object({ movieId: watchlistMovieIdSchema });
