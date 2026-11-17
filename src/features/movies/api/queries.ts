import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import {
  discoverMovies,
  getGenres,
  getMovieDetails,
  getMovieList,
  getMovieVideos,
} from "@/features/movies/api/movies.api";
import { movieKeys } from "@/features/movies/api/query-keys";
import { TMDB_MAX_PAGE } from "@/features/movies/constants";
import type { DiscoverFilters, Movie, TMDBResponse } from "@/features/movies/types";
import type { MovieList } from "@/features/movies/validations/movies.schema";
import { DAY_MS } from "@/shared/lib/time";

export const movieListQuery = (list: MovieList) =>
  queryOptions({ queryKey: movieKeys.list(list), queryFn: () => getMovieList(list) });

export const movieDetailsQuery = (id: number) =>
  queryOptions({ queryKey: movieKeys.details(id), queryFn: () => getMovieDetails(id) });

// Genres and trailers practically never change
export const genresQuery = () =>
  queryOptions({ queryKey: movieKeys.genres(), queryFn: getGenres, staleTime: DAY_MS });

export const movieVideosQuery = (id: number) =>
  queryOptions({
    queryKey: movieKeys.videos(id),
    queryFn: () => getMovieVideos(id),
    staleTime: DAY_MS,
  });

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
