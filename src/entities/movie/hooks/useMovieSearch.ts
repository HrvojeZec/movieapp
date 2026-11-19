import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { searchMovies } from "@/entities/movie/api/movies.api";
import { movieKeys } from "@/entities/movie/api/query-keys";

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
