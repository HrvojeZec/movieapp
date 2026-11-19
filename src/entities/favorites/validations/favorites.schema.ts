import { z } from "zod";
import { INVALID_MOVIE_ID, movieIdStringSchema } from "@/entities/movie/validations/movies.schema";

export { INVALID_MOVIE_ID };
export const favoriteMovieIdSchema = movieIdStringSchema;

export const addFavoriteSchema = z.object({ movieId: favoriteMovieIdSchema });
