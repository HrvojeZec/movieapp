import {
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
  useInfiniteQuery,
  useQueries,
  useQuery,
} from "@tanstack/react-query";
import {
  discoverMovies,
  getGenres,
  getMovieDetails,
  getMovieList,
  getMovieVideos,
  searchMovies,
  type DiscoverFilters,
  type TMDBResponse,
  type Movie,
} from "./api";
import type { MovieList } from "./validation";

// TMDB serves at most 500 pages per list, regardless of total_pages
const TMDB_MAX_PAGE = 500;
const DAY = 24 * 60 * 60 * 1000;

export const movieKeys = {
  all: ["movies"] as const,
  list: (list: MovieList) => [...movieKeys.all, "list", list] as const,
  details: (id: number) => [...movieKeys.all, "details", id] as const,
  videos: (id: number) => [...movieKeys.all, "videos", id] as const,
  search: (query: string) => [...movieKeys.all, "search", query] as const,
  discover: (filters: DiscoverFilters) => [...movieKeys.all, "discover", filters] as const,
  genres: () => [...movieKeys.all, "genres"] as const,
};

export const movieListQuery = (list: MovieList) =>
  queryOptions({ queryKey: movieKeys.list(list), queryFn: () => getMovieList(list) });

export const movieDetailsQuery = (id: number) =>
  queryOptions({ queryKey: movieKeys.details(id), queryFn: () => getMovieDetails(id) });

export const genresQuery = () =>
  queryOptions({ queryKey: movieKeys.genres(), queryFn: getGenres, staleTime: DAY });

export function getNextPage(lastPage: TMDBResponse<Movie>): number | undefined {
  const lastAvailable = Math.min(lastPage.total_pages, TMDB_MAX_PAGE);
  return lastPage.page < lastAvailable ? lastPage.page + 1 : undefined;
}

export const discoverInfiniteQuery = (filters: DiscoverFilters) =>
  infiniteQueryOptions({
    queryKey: movieKeys.discover(filters),
    queryFn: ({ pageParam }) => discoverMovies({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: getNextPage,
  });

export function useMovieList(list: MovieList) {
  return useQuery(movieListQuery(list));
}

export function useMovieDetails(id: number) {
  return useQuery({ ...movieDetailsQuery(id), enabled: Number.isInteger(id) && id > 0 });
}

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

export function useMovieVideos(id: number, { enabled = true } = {}) {
  return useQuery({
    queryKey: movieKeys.videos(id),
    queryFn: () => getMovieVideos(id),
    enabled,
    staleTime: DAY,
  });
}

/**
 * Pass a debounced query for search-as-you-type. Suggestions start at 3 characters to avoid noisy
 * requests; previous results stay visible while the next ones load.
 */
export function useMovieSearch(query: string, { minLength = 3 } = {}) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: movieKeys.search(trimmed),
    queryFn: () => searchMovies(trimmed),
    enabled: trimmed.length >= minLength,
    placeholderData: keepPreviousData,
  });
}

export function useGenres() {
  return useQuery(genresQuery());
}

export function useDiscoverMovies(filters: DiscoverFilters, { enabled = true } = {}) {
  return useQuery({
    queryKey: [...movieKeys.discover(filters), "first-page"],
    queryFn: () => discoverMovies(filters),
    enabled,
  });
}

export function useInfiniteDiscoverMovies(filters: DiscoverFilters) {
  return useInfiniteQuery(discoverInfiniteQuery(filters));
}
