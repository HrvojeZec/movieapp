import { useQuery } from "@tanstack/react-query";
import { discoverMovies } from "@/entities/movie/api/movies.api";
import { movieKeys } from "@/entities/movie/api/query-keys";
import type { DiscoverFilters } from "@/entities/movie/types";

/** Only the first page of a discover list, e.g. for a horizontal genre row. */
export function useDiscoverMovies(filters: DiscoverFilters, { enabled = true } = {}) {
  return useQuery({
    queryKey: movieKeys.discoverFirstPage(filters),
    queryFn: () => discoverMovies(filters),
    enabled,
  });
}
