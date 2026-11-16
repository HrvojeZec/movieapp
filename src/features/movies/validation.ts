import { z } from "zod";

// TMDB only serves pages 1-500
const pageSchema = z.coerce.number().int().min(1).max(500).default(1);

export const MOVIE_LISTS = ["popular", "top_rated", "now_playing", "upcoming"] as const;

export const movieListQuerySchema = z.object({
  list: z.enum(MOVIE_LISTS),
  page: pageSchema,
});

export const movieSearchQuerySchema = z.object({
  query: z.string().trim().min(1).max(100),
  page: pageSchema,
});

export const movieDiscoverQuerySchema = z.object({
  year: z.coerce.number().int().min(1870).max(2100).optional(),
  genre: z.coerce.number().int().positive().optional(),
  minRating: z.coerce.number().min(0).max(10).optional(),
  page: pageSchema,
});

export const movieIdSchema = z.coerce.number().int().positive();
