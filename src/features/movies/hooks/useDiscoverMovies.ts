import { useQuery } from "@tanstack/react-query";
import { discoverMovies } from "@/features/movies/api/movies.api";
import { movieKeys } from "@/features/movies/api/query-keys";
import type { DiscoverFilters } from "@/features/movies/types";

/** Only the first page of a discover list, e.g. for a horizontal genre row. */
export function useDiscoverMovies(filters: DiscoverFilters, { enabled = true } = {}) {
  return useQuery({
    queryKey: movieKeys.discoverFirstPage(filters),
    queryFn: () => discoverMovies(filters),
    enabled,
  });
}
