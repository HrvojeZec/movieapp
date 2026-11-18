import { z } from "zod";
import {
  INVALID_MOVIE_ID,
  favoriteMovieIdSchema,
} from "@/features/favorites/validations/favorites.schema";

// The same TMDB movie IDs as favorites
export const watchedMovieIdSchema = favoriteMovieIdSchema;
export { INVALID_MOVIE_ID };

export const markWatchedSchema = z.object({ movieId: watchedMovieIdSchema });

export const watchedPageSchema = z.coerce
  .number()
  .int("Page must be a whole number")
  .min(1, "Page must be at least 1")
  .default(1);
