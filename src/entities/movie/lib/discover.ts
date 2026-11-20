import {
  DEFAULT_DISCOVER_SORT,
  DISCOVER_SORTS,
  RATING_SORT_MIN_VOTES,
} from "@/entities/movie/constants";
import { parseNumberParam } from "@/entities/movie/lib/filters";
import type {
  AdvancedDiscoverFilters,
  DiscoverFilters,
  DiscoverSort,
} from "@/entities/movie/types";

type AllDiscoverFilters = DiscoverFilters & AdvancedDiscoverFilters & { page?: number };
type TmdbParams = Record<string, string | number | undefined>;

const unique = (values: number[]) => [...new Set(values)];

/** TMDB /discover/movie parameters for the basic and advanced filters; unset ones are left out. */
export function buildDiscoverParams(filters: AllDiscoverFilters): TmdbParams {
  const sortBy = filters.sortBy ?? DEFAULT_DISCOVER_SORT;
  const genres = unique([...(filters.genre ? [filters.genre] : []), ...(filters.genres ?? [])]);
  const minVotes =
    filters.minVotes ?? (sortBy === "vote_average.desc" ? RATING_SORT_MIN_VOTES : undefined);

  const params: TmdbParams = {
    page: filters.page ?? 1,
    sort_by: sortBy,
    primary_release_year: filters.year,
    "primary_release_date.gte": filters.yearFrom && `${filters.yearFrom}-01-01`,
    "primary_release_date.lte": filters.yearTo && `${filters.yearTo}-12-31`,
    // Comma-separated means all of them (a pipe would mean any)
    with_genres: genres.length > 0 ? genres.join(",") : undefined,
    "vote_average.gte": filters.minRating,
    "vote_count.gte": minVotes,
    "with_runtime.gte": filters.runtimeMin,
    "with_runtime.lte": filters.runtimeMax,
    with_original_language: filters.language,
  };
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined));
}

// URL parameter for each advanced filter, short like the basic ones (?from=1990&sort=title.asc)
export const ADVANCED_FILTER_PARAMS = {
  yearFrom: "from",
  yearTo: "to",
  genres: "genres",
  runtimeMin: "runtimeMin",
  runtimeMax: "runtimeMax",
  language: "lang",
  sortBy: "sort",
  minVotes: "votes",
} as const satisfies Record<keyof AdvancedDiscoverFilters, string>;

const LANGUAGE_PATTERN = /^[a-z]{2}$/;
const isSort = (value: string | null): value is DiscoverSort =>
  (DISCOVER_SORTS as readonly (string | null)[]).includes(value);

/**
 * The advanced filters in a URL. Values a hand-edited link got wrong are dropped rather than sent,
 * so the page shows results instead of an error.
 */
export function parseAdvancedFilters(params: URLSearchParams): AdvancedDiscoverFilters {
  const get = (key: keyof typeof ADVANCED_FILTER_PARAMS) => params.get(ADVANCED_FILTER_PARAMS[key]);
  const genres = (get("genres") ?? "")
    .split(",")
    .map((value) => parseNumberParam(value))
    .filter(
      (value): value is number => value !== undefined && Number.isInteger(value) && value > 0,
    );
  const language = get("language");
  const sortBy = get("sortBy");

  const filters: AdvancedDiscoverFilters = {
    yearFrom: parseNumberParam(get("yearFrom")),
    yearTo: parseNumberParam(get("yearTo")),
    genres: genres.length > 0 ? unique(genres) : undefined,
    runtimeMin: parseNumberParam(get("runtimeMin")),
    runtimeMax: parseNumberParam(get("runtimeMax")),
    language: language && LANGUAGE_PATTERN.test(language) ? language : undefined,
    sortBy: isSort(sortBy) ? sortBy : undefined,
    minVotes: parseNumberParam(get("minVotes")),
  };
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined),
  ) as AdvancedDiscoverFilters;
}

export const hasAdvancedFilters = (filters: AdvancedDiscoverFilters): boolean =>
  Object.values(filters).some((value) =>
    Array.isArray(value) ? value.length > 0 : value !== undefined,
  );
