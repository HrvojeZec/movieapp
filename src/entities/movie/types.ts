import type { DISCOVER_SORTS } from "@/entities/movie/constants";
export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  original_title: string;
  popularity: number;
  video: boolean;
}

/** What a movie card needs; small enough to keep in localStorage (recently viewed). */
export type MovieSummary = Pick<
  Movie,
  "id" | "title" | "poster_path" | "release_date" | "vote_average"
>;

export interface MovieDetails extends Movie {
  genres: { id: number; name: string }[];
  runtime: number;
  production_countries: { iso_3166_1: string; name: string }[];
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[];
  };
}

export interface Genre {
  id: number;
  name: string;
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
}

// Image widths offered by TMDB's CDN
export type TmdbImageSize = "w200" | "w300" | "w500" | "w780" | "w1280" | "original";

export interface DiscoverFilters {
  year?: number;
  genre?: number;
  minRating?: number;
}

export type DiscoverSort = (typeof DISCOVER_SORTS)[number];

/** The Premium filters on top of the basic ones. */
export interface AdvancedDiscoverFilters {
  yearFrom?: number;
  yearTo?: number;
  /** Movies must have all of these genres. */
  genres?: number[];
  /** Minutes */
  runtimeMin?: number;
  runtimeMax?: number;
  /** ISO 639-1 code of the original language, e.g. "fr" */
  language?: string;
  sortBy?: DiscoverSort;
  minVotes?: number;
}
