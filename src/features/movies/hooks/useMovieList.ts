import { useQuery } from "@tanstack/react-query";
import { movieListQuery } from "@/features/movies/api/queries";
import type { MovieList } from "@/features/movies/validations/movies.schema";

export function useMovieList(list: MovieList) {
  return useQuery(movieListQuery(list));
}
