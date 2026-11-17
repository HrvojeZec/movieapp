import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import {
  discoverMovies,
  getGenres,
  getMovieDetails,
  getMovieList,
} from "@/features/movies/api/movies.api";
import { DAY, TMDB_MAX_PAGE } from "@/features/movies/constants";
import type { DiscoverFilters, Movie, TMDBResponse } from "@/features/movies/types";
import type { MovieList } from "@/features/movies/validations/movies.schema";

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
