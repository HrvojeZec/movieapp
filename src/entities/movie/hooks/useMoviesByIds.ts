import { useQueries } from "@tanstack/react-query";
import { movieDetailsQuery } from "@/entities/movie/api/queries";

/** Details for several movies at once; shares the cache with useMovieDetails. */
export function useMoviesByIds(ids: number[]) {
  return useQueries({
    queries: ids.map((id) => movieDetailsQuery(id)),
    combine: (results) => ({
      movies: results.flatMap((result) => (result.data ? [result.data] : [])),
      isPending: results.some((result) => result.isPending),
      isError: results.some((result) => result.isError),
      refetch: () => results.forEach((result) => result.refetch()),
    }),
  });
}
