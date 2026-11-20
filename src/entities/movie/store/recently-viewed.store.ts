import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { RECENTLY_VIEWED_LIMIT, RECENTLY_VIEWED_STORAGE_KEY } from "@/entities/movie/constants";
import {
  addRecentMovie,
  freshRecentMovies,
  type RecentMovie,
} from "@/entities/movie/lib/recently-viewed";
import type { MovieSummary } from "@/entities/movie/types";

interface RecentlyViewedState {
  movies: RecentMovie[];
  add: (movie: MovieSummary) => void;
  clear: () => void;
}

// Version 2 dates every entry; version 1 lists have no dates and are dropped
const STORAGE_VERSION = 2;

// Client state only (server data lives in TanStack Query). Persisted per browser, no account needed.
export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      movies: [],
      add: (movie) =>
        set((state) => ({
          movies: addRecentMovie(state.movies, movie, RECENTLY_VIEWED_LIMIT, Date.now()),
        })),
      clear: () => set({ movies: [] }),
    }),
    {
      name: RECENTLY_VIEWED_STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ movies: state.movies }),
      migrate: () => ({ movies: [] }),
      // Movies past TMDB's 6-month limit are forgotten whenever the list is loaded
      merge: (persisted, current) => ({
        ...current,
        movies: freshRecentMovies(
          (persisted as Partial<RecentlyViewedState> | undefined)?.movies ?? [],
          Date.now(),
        ),
      }),
      // Read localStorage only after mounting: the server-rendered HTML has no recent movies, and
      // the first client render must match it
      skipHydration: true,
    },
  ),
);

/** Loads the saved list once; safe to call from several components. */
export async function hydrateRecentlyViewed(): Promise<void> {
  if (!useRecentlyViewedStore.persist.hasHydrated()) {
    await useRecentlyViewedStore.persist.rehydrate();
  }
}
