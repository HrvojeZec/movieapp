import { z } from "zod";
import {
  DISCOVER_SORTS,
  MAX_GENRE_FILTERS,
  MAX_MIN_VOTES,
  MAX_RATING,
  MAX_RELEASE_YEAR,
  MAX_RUNTIME_MINUTES,
  MIN_RELEASE_YEAR,
  SEARCH_QUERY_MAX_LENGTH,
  TMDB_MAX_PAGE,
} from "@/entities/movie/constants";

export const INVALID_MOVIE_ID = "Invalid movie ID";

// TMDB movie IDs are positive integers; favorites, lists and the rest store them as strings
export const movieIdStringSchema = z.string().regex(/^[1-9]\d{0,9}$/, INVALID_MOVIE_ID);

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

const releaseYearSchema = z.coerce.number().int().min(MIN_RELEASE_YEAR).max(MAX_RELEASE_YEAR);
const runtimeSchema = z.coerce.number().int().min(0).max(MAX_RUNTIME_MINUTES);

export const movieDiscoverQuerySchema = z.object({
  year: releaseYearSchema.optional(),
  genre: z.coerce.number().int().positive().optional(),
  minRating: z.coerce.number().min(0).max(MAX_RATING).optional(),
  page: pageSchema,
});

// "18,53": TMDB genre IDs, each counted once
const genreListSchema = z
  .string()
  .regex(/^\d+(,\d+)*$/, "Genres must be a comma-separated list of genre IDs")
  .transform((value) => [...new Set(value.split(",").map(Number))])
  .pipe(z.array(z.number().int().positive()).max(MAX_GENRE_FILTERS));

const isOrdered = (from?: number, to?: number) =>
  from === undefined || to === undefined || from <= to;

/** The Premium discover filters, on top of the basic ones. */
export const advancedDiscoverQuerySchema = movieDiscoverQuerySchema
  .extend({
    yearFrom: releaseYearSchema.optional(),
    yearTo: releaseYearSchema.optional(),
    genres: genreListSchema.optional(),
    runtimeMin: runtimeSchema.optional(),
    runtimeMax: runtimeSchema.optional(),
    language: z
      .string()
      .regex(/^[a-z]{2}$/, "Language must be a two-letter ISO 639-1 code")
      .optional(),
    sortBy: z.enum(DISCOVER_SORTS).optional(),
    minVotes: z.coerce.number().int().min(0).max(MAX_MIN_VOTES).optional(),
  })
  .refine((filters) => isOrdered(filters.yearFrom, filters.yearTo), {
    message: "The start year must not be after the end year",
    path: ["yearFrom"],
  })
  .refine((filters) => isOrdered(filters.runtimeMin, filters.runtimeMax), {
    message: "The minimum runtime must not be above the maximum",
    path: ["runtimeMin"],
  });

export const movieIdSchema = z.coerce.number().int().positive();

// A movie page visit; the same string movie IDs as favorites
export const movieViewSchema = z.object({ movieId: movieIdStringSchema });
