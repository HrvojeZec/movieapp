import { z } from "zod";
import {
  INVALID_MOVIE_ID,
  favoriteMovieIdSchema,
} from "@/features/favorites/validations/favorites.schema";

// The same TMDB movie IDs as favorites
export const watchlistMovieIdSchema = favoriteMovieIdSchema;
export { INVALID_MOVIE_ID };

export const addToWatchlistSchema = z.object({ movieId: watchlistMovieIdSchema });
