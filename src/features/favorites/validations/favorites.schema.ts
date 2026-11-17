import { z } from "zod";

export const INVALID_MOVIE_ID = "Invalid movie ID";

// TMDB movie IDs are positive integers; favorites store them as strings.
export const favoriteMovieIdSchema = z.string().regex(/^[1-9]\d{0,9}$/, INVALID_MOVIE_ID);

export const addFavoriteSchema = z.object({ movieId: favoriteMovieIdSchema });
