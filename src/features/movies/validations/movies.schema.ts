import { z } from "zod";
import {
  MAX_RATING,
  MAX_RELEASE_YEAR,
  MIN_RELEASE_YEAR,
  SEARCH_QUERY_MAX_LENGTH,
  TMDB_MAX_PAGE,
} from "@/features/movies/constants";

const pageSchema = z.coerce.number().int().min(1).max(TMDB_MAX_PAGE).default(1);

export const MOVIE_LISTS = ["popular", "top_rated", "now_playing", "upcoming"] as const;
export type MovieList = (typeof MOVIE_LISTS)[number];

export const movieListQuerySchema = z.object({
  list: z.enum(MOVIE_LISTS),
  page: pageSchema,
});

export const movieSearchQuerySchema = z.object({
  query: z.string().trim().min(1).max(SEARCH_QUERY_MAX_LENGTH),
  page: pageSchema,
});

export const movieDiscoverQuerySchema = z.object({
  year: z.coerce.number().int().min(MIN_RELEASE_YEAR).max(MAX_RELEASE_YEAR).optional(),
  genre: z.coerce.number().int().positive().optional(),
  minRating: z.coerce.number().min(0).max(MAX_RATING).optional(),
  page: pageSchema,
});

export const movieIdSchema = z.coerce.number().int().positive();
