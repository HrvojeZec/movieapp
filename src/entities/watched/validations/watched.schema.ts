import { z } from "zod";
import { INVALID_MOVIE_ID, movieIdStringSchema } from "@/entities/movie/validations/movies.schema";

// The same TMDB movie IDs as favorites
export const watchedMovieIdSchema = movieIdStringSchema;
export { INVALID_MOVIE_ID };

export const markWatchedSchema = z.object({ movieId: watchedMovieIdSchema });

export const watchedPageSchema = z.coerce
  .number()
  .int("Page must be a whole number")
  .min(1, "Page must be at least 1")
  .default(1);
