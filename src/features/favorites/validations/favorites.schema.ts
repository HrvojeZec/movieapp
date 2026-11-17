import { z } from "zod";

// TMDB movie IDs are positive integers; favorites store them as strings.
export const favoriteMovieIdSchema = z.string().regex(/^[1-9]\d{0,9}$/, "Invalid movie ID");
