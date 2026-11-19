import { useQuery } from "@tanstack/react-query";
import { movieListQuery } from "@/entities/movie/api/queries";
import type { MovieList } from "@/entities/movie/validations/movies.schema";

export function useMovieList(list: MovieList) {
  return useQuery(movieListQuery(list));
}
