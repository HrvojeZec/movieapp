import axios from "axios";
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from "@/utils";

const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

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

export const getImageUrl = (
  path: string | null,
  size: "w200" | "w300" | "w500" | "w780" | "w1280" | "original" = "w500"
) => {
  if (!path) return "/placeholder-movie.jpg";
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

export const getPopularMovies = async (
  page = 1
): Promise<TMDBResponse<Movie>> => {
  const response = await tmdbApi.get("/movie/popular", { params: { page } });
  return response.data;
};

export const getTopRatedMovies = async (
  page = 1
): Promise<TMDBResponse<Movie>> => {
  const response = await tmdbApi.get("/movie/top_rated", { params: { page } });
  return response.data;
};

export const getNowPlayingMovies = async (
  page = 1
): Promise<TMDBResponse<Movie>> => {
  const response = await tmdbApi.get("/movie/now_playing", {
    params: { page },
  });
  return response.data;
};

export const getUpcomingMovies = async (
  page = 1
): Promise<TMDBResponse<Movie>> => {
  const response = await tmdbApi.get("/movie/upcoming", { params: { page } });
  return response.data;
};

export const getMovieDetails = async (
  movieId: number
): Promise<MovieDetails> => {
  const response = await tmdbApi.get(`/movie/${movieId}`, {
    params: { append_to_response: "credits" },
  });
  return response.data;
};

export const searchMovies = async (
  query: string,
  page = 1
): Promise<TMDBResponse<Movie>> => {
  const response = await tmdbApi.get("/search/movie", {
    params: { query, page, include_adult: false },
  });
  return response.data;
};

export const getGenres = async (): Promise<Genre[]> => {
  const response = await tmdbApi.get("/genre/movie/list");
  return response.data.genres;
};

export const getMoviesByGenre = async (
  genreId: number,
  page = 1
): Promise<TMDBResponse<Movie>> => {
  const response = await tmdbApi.get("/discover/movie", {
    params: { with_genres: genreId, page, sort_by: "popularity.desc" },
  });
  return response.data;
};

export const discoverMovies = async (params: {
  year?: number;
  genre?: number;
  minRating?: number;
  page?: number;
}): Promise<TMDBResponse<Movie>> => {
  const apiParams: any = {
    page: params.page || 1,
    sort_by: "popularity.desc",
  };

  if (params.year) {
    apiParams.primary_release_year = params.year;
  }
  if (params.genre) {
    apiParams.with_genres = params.genre;
  }
  if (params.minRating) {
    apiParams["vote_average.gte"] = params.minRating;
  }

  const response = await tmdbApi.get("/discover/movie", { params: apiParams });
  return response.data;
};

export const getMovieVideos = async (movieId: number): Promise<Video[]> => {
  const response = await tmdbApi.get(`/movie/${movieId}/videos`);
  return response.data.results;
};

export const getTrailerUrl = (videos: Video[]): string | null => {
  const officialTrailer = videos.find(
    (video) =>
      video.type === "Trailer" && video.official && video.site === "YouTube"
  );

  if (officialTrailer) {
    return `https://www.youtube.com/embed/${officialTrailer.key}?autoplay=1&rel=0`;
  }

  const anyTrailer = videos.find(
    (video) => video.type === "Trailer" && video.site === "YouTube"
  );

  if (anyTrailer) {
    return `https://www.youtube.com/embed/${anyTrailer.key}?autoplay=1&rel=0`;
  }

  return null;
};
