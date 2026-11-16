// TMDB's public image CDN; serving posters needs no API key
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// Client-side access to movie data. All requests go through our own API routes
// (src/app/api/movies, src/app/api/genres), which call TMDB on the server with the secret key.
async function getJson<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
): Promise<T> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) query.set(key, String(value));
  }
  const queryString = query.toString();
  const response = await fetch(queryString ? `${path}?${queryString}` : path);
  if (!response.ok) {
    throw new Error(`Request to ${path} failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

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
  size: "w200" | "w300" | "w500" | "w780" | "w1280" | "original" = "w500",
) => {
  if (!path) return "/placeholder-movie.svg";
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

export const getPopularMovies = (page = 1) =>
  getJson<TMDBResponse<Movie>>("/api/movies", { list: "popular", page });

export const getTopRatedMovies = (page = 1) =>
  getJson<TMDBResponse<Movie>>("/api/movies", { list: "top_rated", page });

export const getNowPlayingMovies = (page = 1) =>
  getJson<TMDBResponse<Movie>>("/api/movies", { list: "now_playing", page });

export const getUpcomingMovies = (page = 1) =>
  getJson<TMDBResponse<Movie>>("/api/movies", { list: "upcoming", page });

export const getMovieDetails = (movieId: number) => getJson<MovieDetails>(`/api/movies/${movieId}`);

export const searchMovies = (query: string, page = 1) =>
  getJson<TMDBResponse<Movie>>("/api/movies/search", { query, page });

export const getGenres = async (): Promise<Genre[]> => {
  const data = await getJson<{ genres: Genre[] }>("/api/genres");
  return data.genres;
};

export const getMoviesByGenre = (genreId: number, page = 1) =>
  discoverMovies({ genre: genreId, page });

export const discoverMovies = (params: {
  year?: number;
  genre?: number;
  minRating?: number;
  page?: number;
}) => getJson<TMDBResponse<Movie>>("/api/movies/discover", params);

export const getMovieVideos = async (movieId: number): Promise<Video[]> => {
  const data = await getJson<{ results: Video[] }>(`/api/movies/${movieId}/videos`);
  return data.results;
};

export const getTrailerUrl = (videos: Video[]): string | null => {
  const officialTrailer = videos.find(
    (video) => video.type === "Trailer" && video.official && video.site === "YouTube",
  );

  if (officialTrailer) {
    return `https://www.youtube.com/embed/${officialTrailer.key}?autoplay=1&rel=0`;
  }

  const anyTrailer = videos.find((video) => video.type === "Trailer" && video.site === "YouTube");

  if (anyTrailer) {
    return `https://www.youtube.com/embed/${anyTrailer.key}?autoplay=1&rel=0`;
  }

  return null;
};
