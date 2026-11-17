import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { parseNumberParam, updateQuery } from "@/features/movies/lib/filters";
import type { DiscoverFilters } from "@/features/movies/types";

// URL parameter for each filter; the URL is kept short and readable (?year=2024&rating=7)
const FILTER_PARAMS = { year: "year", genre: "genre", minRating: "rating" } as const;

type FilterKey = keyof typeof FILTER_PARAMS;

const NO_FILTERS = Object.fromEntries(Object.values(FILTER_PARAMS).map((name) => [name, null]));

/**
 * Discover filters stored in the URL, the single source of truth, so they survive reloads and
 * can be shared. `values` are the raw strings for the inputs, `filters` the parsed numbers.
 */
export function useDiscoverFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const year = searchParams.get(FILTER_PARAMS.year);
  const genre = searchParams.get(FILTER_PARAMS.genre);
  const minRating = searchParams.get(FILTER_PARAMS.minRating);

  const filters = useMemo<DiscoverFilters>(
    () => ({
      year: parseNumberParam(year),
      genre: parseNumberParam(genre),
      minRating: parseNumberParam(minRating),
    }),
    [year, genre, minRating],
  );

  const applyChanges = useCallback(
    (changes: Record<string, string | null>) => {
      const query = updateQuery(searchParams.toString(), changes);
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const setFilter = useCallback(
    (key: FilterKey, value: string | null) => applyChanges({ [FILTER_PARAMS[key]]: value }),
    [applyChanges],
  );

  const clearFilters = useCallback(() => applyChanges(NO_FILTERS), [applyChanges]);

  return {
    filters,
    values: { year, genre, minRating },
    hasFilters: Boolean(year || genre || minRating),
    setFilter,
    clearFilters,
  };
}
