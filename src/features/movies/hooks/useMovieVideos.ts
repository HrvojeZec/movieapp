import { useQuery } from "@tanstack/react-query";
import { getMovieVideos } from "@/features/movies/api/movies.api";
import { movieKeys } from "@/features/movies/api/queries";
import { DAY } from "@/features/movies/constants";

export function useMovieVideos(id: number, { enabled = true } = {}) {
  return useQuery({
    queryKey: movieKeys.videos(id),
    queryFn: () => getMovieVideos(id),
    enabled,
    staleTime: DAY,
  });
}
