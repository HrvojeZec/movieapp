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
import { API_ROUTES } from "@/shared/api-routes";
import { fetchJson, withQuery } from "@/shared/lib/http";

// Client-side access to movie data. All requests go through our own API routes
// (src/app/api/movies, src/app/api/genres), which call TMDB on the server with the secret key.

export const getMovieList = (list: MovieList, page = 1) =>
  fetchJson<TMDBResponse<Movie>>(withQuery(API_ROUTES.movies.list, { list, page }));

export const getMovieDetails = (movieId: number) =>
  fetchJson<MovieDetails>(API_ROUTES.movies.details(movieId));

export const searchMovies = (query: string, page = 1) =>
  fetchJson<TMDBResponse<Movie>>(withQuery(API_ROUTES.movies.search, { query, page }));

export const getGenres = async (): Promise<Genre[]> => {
  const data = await fetchJson<{ genres: Genre[] }>(API_ROUTES.genres);
  return data.genres;
};

export const discoverMovies = ({ page = 1, ...filters }: DiscoverFilters & { page?: number }) =>
  fetchJson<TMDBResponse<Movie>>(withQuery(API_ROUTES.movies.discover, { ...filters, page }));

/** Premium: the basic and advanced filters together. */
export const discoverMoviesAdvanced = ({
  page = 1,
  genres,
  ...filters
}: DiscoverFilters & AdvancedDiscoverFilters & { page?: number }) =>
  fetchJson<TMDBResponse<Movie>>(
    withQuery(API_ROUTES.movies.advancedDiscover, { ...filters, genres: genres?.join(","), page }),
  );

export const getMovieVideos = async (movieId: number): Promise<Video[]> => {
  const data = await fetchJson<{ results: Video[] }>(API_ROUTES.movies.videos(movieId));
  return data.results;
};
