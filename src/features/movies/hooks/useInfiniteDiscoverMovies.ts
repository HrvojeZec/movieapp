import { useInfiniteQuery } from "@tanstack/react-query";
import { discoverInfiniteQuery } from "@/features/movies/api/queries";
import type { DiscoverFilters } from "@/features/movies/types";

export function useInfiniteDiscoverMovies(filters: DiscoverFilters) {
  return useInfiniteQuery(discoverInfiniteQuery(filters));
}
