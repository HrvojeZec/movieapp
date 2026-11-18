import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ADVANCED_FILTER_PARAMS,
  hasAdvancedFilters,
  parseAdvancedFilters,
} from "@/features/movies/lib/discover";
import { parseNumberParam, updateQuery } from "@/features/movies/lib/filters";
import type { AdvancedDiscoverFilters, DiscoverFilters } from "@/features/movies/types";

// URL parameter for each filter; the URL is kept short and readable (?year=2024&rating=7)
const FILTER_PARAMS = { year: "year", genre: "genre", minRating: "rating" } as const;

type FilterKey = keyof typeof FILTER_PARAMS;
export type AdvancedFilterKey = keyof typeof ADVANCED_FILTER_PARAMS;

const NO_FILTERS = Object.fromEntries(
  [...Object.values(FILTER_PARAMS), ...Object.values(ADVANCED_FILTER_PARAMS)].map((name) => [
    name,
    null,
  ]),
);

/**
 * Discover filters stored in the URL, the single source of truth, so they survive reloads and
 * can be shared. `values` are the raw strings for the inputs, `filters` and `advanced` the parsed
 * values. Whether the advanced ones may be used is the caller's decision (it depends on the plan).
 */
export function useDiscoverFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

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

  const advanced = useMemo<AdvancedDiscoverFilters>(
    () => parseAdvancedFilters(new URLSearchParams(query)),
    [query],
  );

  const advancedValues = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(ADVANCED_FILTER_PARAMS).map(([key, name]) => [
          key,
          new URLSearchParams(query).get(name),
        ]),
      ) as Record<AdvancedFilterKey, string | null>,
    [query],
  );

  const applyChanges = useCallback(
    (changes: Record<string, string | null>) => {
      const next = updateQuery(query, changes);
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    },
    [router, pathname, query],
  );

  const setFilter = useCallback(
    (key: FilterKey, value: string | null) => applyChanges({ [FILTER_PARAMS[key]]: value }),
    [applyChanges],
  );

  const setAdvancedFilter = useCallback(
    (key: AdvancedFilterKey, value: string | null) =>
      applyChanges({ [ADVANCED_FILTER_PARAMS[key]]: value }),
    [applyChanges],
  );

  const clearFilters = useCallback(() => applyChanges(NO_FILTERS), [applyChanges]);
  const hasAdvanced = hasAdvancedFilters(advanced);

  return {
    filters,
    advanced,
    values: { year, genre, minRating },
    advancedValues,
    hasFilters: Boolean(year || genre || minRating) || hasAdvanced,
    hasAdvanced,
    setFilter,
    setAdvancedFilter,
    clearFilters,
  };
}
