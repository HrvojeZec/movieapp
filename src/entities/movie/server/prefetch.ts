import type { QueryClient } from "@tanstack/react-query";
import { movieKeys } from "@/entities/movie/api/query-keys";
import { HOME_LISTS } from "@/entities/movie/constants";
import { fetchGenres, fetchMovieList } from "./movies";

// Same query keys as the client hooks, so the hydrated data is used without a refetch

/** Everything above the fold on the home page: hero, the movie lists and the genre rows. */
export function prefetchHomeMovies(queryClient: QueryClient) {
  return Promise.all([
    ...Object.values(HOME_LISTS).map((list) =>
      queryClient.prefetchQuery({
        queryKey: movieKeys.list(list),
        queryFn: () => fetchMovieList(list),
      }),
    ),
    queryClient.prefetchQuery({ queryKey: movieKeys.genres(), queryFn: fetchGenres }),
  ]);
}
