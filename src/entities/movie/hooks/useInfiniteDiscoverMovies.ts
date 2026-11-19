import { useInfiniteQuery } from "@tanstack/react-query";
import { advancedDiscoverInfiniteQuery, discoverInfiniteQuery } from "@/entities/movie/api/queries";
import type { AdvancedDiscoverFilters, DiscoverFilters } from "@/entities/movie/types";

/**
 * Discover results. With advanced filters (only passed for plans that include them) the request
 * goes to the private Premium route; otherwise to the public, cached one. Only one of the two
 * queries is ever enabled.
 */
export function useInfiniteDiscoverMovies(
  filters: DiscoverFilters,
  advanced: AdvancedDiscoverFilters | null = null,
) {
  const basic = useInfiniteQuery({ ...discoverInfiniteQuery(filters), enabled: !advanced });
  const premium = useInfiniteQuery({
    ...advancedDiscoverInfiniteQuery({ ...filters, ...advanced }),
    enabled: Boolean(advanced),
  });
  return advanced ? premium : basic;
}
