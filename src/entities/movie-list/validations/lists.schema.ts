import { z } from "zod";
import { LIST_NAME_MAX_LENGTH, MAX_MOVIES_PER_LIST } from "@/entities/movie-list/constants";
import { INVALID_MOVIE_ID, movieIdStringSchema } from "@/entities/movie/validations/movies.schema";

export { INVALID_MOVIE_ID };
export const listMovieIdSchema = movieIdStringSchema;

/** A MongoDB ObjectId; anything else can't be a list, so the routes answer 404. */
export const LIST_ID_PATTERN = /^[a-f\d]{24}$/i;

const listNameSchema = z
  .string()
  .trim()
  .min(1, "Give the list a name")
  .max(LIST_NAME_MAX_LENGTH, `A list name can be up to ${LIST_NAME_MAX_LENGTH} characters`);

export const createListSchema = z.object({
  name: listNameSchema,
  /** Optional first movie, when the list is created from a movie's "Add to list" menu. */
  movieId: listMovieIdSchema.optional(),
});

export const renameListSchema = z.object({ name: listNameSchema });

export const addListMovieSchema = z.object({ movieId: listMovieIdSchema });

/** A new order for a list: every movie once (the server checks they are the list's movies). */
export const reorderListSchema = z.object({
  movieIds: z
    .array(listMovieIdSchema)
    .min(1)
    .max(MAX_MOVIES_PER_LIST)
    .refine((ids) => new Set(ids).size === ids.length, "Each movie can only appear once"),
});
