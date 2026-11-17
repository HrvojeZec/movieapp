import { useEffect } from "react";
import {
  hydrateRecentlyViewed,
  useRecentlyViewedStore,
} from "@/features/movies/store/recently-viewed.store";
import type { MovieSummary } from "@/features/movies/types";

/** Recently viewed movies, newest first; empty until the saved list has loaded after mount. */
export function useRecentlyViewed(): MovieSummary[] {
  const movies = useRecentlyViewedStore((state) => state.movies);

  useEffect(() => {
    void hydrateRecentlyViewed();
  }, []);

  return movies;
}

/** Records a visit to a movie page. */
export function useTrackRecentlyViewed(movie: MovieSummary | undefined) {
  const add = useRecentlyViewedStore((state) => state.add);

  useEffect(() => {
    if (!movie) return;
    // Load the saved list first; adding before that would be overwritten by it. Adding the same
    // movie again (e.g. after a refetch) changes nothing, as it is already first.
    void hydrateRecentlyViewed().then(() => add(movie));
  }, [movie, add]);
}
