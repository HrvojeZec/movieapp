import { cache } from "react";
import { buildDiscoverParams } from "@/features/movies/lib/discover";
import type {
  AdvancedDiscoverFilters,
  DiscoverFilters,
  Genre,
  Movie,
  MovieDetails,
  TMDBResponse,
  Video,
} from "@/features/movies/types";
import type { MovieList } from "@/features/movies/validations/movies.schema";
import { tmdbFetch } from "./tmdb";

// Every TMDB endpoint the app uses, shared by the API routes and the server-rendered pages.
// The return types match the client fetchers in api/movies.api.ts, so server-prefetched data
// can go straight into the same query cache entries.

export const fetchMovieList = (list: MovieList, page = 1) =>
  tmdbFetch<TMDBResponse<Movie>>(`/movie/${list}`, { page });

/** Details with cast. Cached per request, so a page and its metadata share one TMDB call. */
export const fetchMovieDetails = cache((id: number) =>
  tmdbFetch<MovieDetails>(`/movie/${id}`, { append_to_response: "credits" }),
);

export const fetchMovieVideos = async (id: number): Promise<Video[]> =>
  (await tmdbFetch<{ results: Video[] }>(`/movie/${id}/videos`)).results;

export const fetchGenres = async (): Promise<Genre[]> =>
  (await tmdbFetch<{ genres: Genre[] }>("/genre/movie/list")).genres;

export const fetchSearchResults = (query: string, page = 1) =>
  tmdbFetch<TMDBResponse<Movie>>("/search/movie", { query, page, include_adult: false });

/** Discover with the basic filters (public route) or the advanced ones too (Premium route). */
export const fetchDiscover = (
  filters: DiscoverFilters & AdvancedDiscoverFilters & { page?: number },
) => tmdbFetch<TMDBResponse<Movie>>("/discover/movie", buildDiscoverParams(filters));
