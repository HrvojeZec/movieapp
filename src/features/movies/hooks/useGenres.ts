import { useQuery } from "@tanstack/react-query";
import { genresQuery } from "@/features/movies/api/queries";

export function useGenres() {
  return useQuery(genresQuery());
}
