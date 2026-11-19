import { useQuery } from "@tanstack/react-query";
import { movieVideosQuery } from "@/entities/movie/api/queries";

export function useMovieVideos(id: number, { enabled = true } = {}) {
  return useQuery({ ...movieVideosQuery(id), enabled });
}
