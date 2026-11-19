import { useQuery } from "@tanstack/react-query";
import { genresQuery } from "@/entities/movie/api/queries";

export function useGenres() {
  return useQuery(genresQuery());
}
