import { useQuery } from "@tanstack/react-query";
import { discoverMovies } from "@/features/movies/api/movies.api";
import { movieKeys } from "@/features/movies/api/queries";
import type { DiscoverFilters } from "@/features/movies/types";

export function useDiscoverMovies(filters: DiscoverFilters, { enabled = true } = {}) {
  return useQuery({
    queryKey: [...movieKeys.discover(filters), "first-page"],
    queryFn: () => discoverMovies(filters),
    enabled,
  });
}
