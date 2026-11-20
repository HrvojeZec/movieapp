import { useQuery } from "@tanstack/react-query";
import { movieDetailsQuery } from "@/entities/movie/api/queries";

export function useMovieDetails(id: number) {
  return useQuery({ ...movieDetailsQuery(id), enabled: Number.isInteger(id) && id > 0 });
}
