import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { RECENTLY_VIEWED_LIMIT, RECENTLY_VIEWED_STORAGE_KEY } from "@/entities/movie/constants";
import { addRecentMovie } from "@/entities/movie/lib/recently-viewed";
import type { MovieSummary } from "@/entities/movie/types";

interface RecentlyViewedState {
  movies: MovieSummary[];
  add: (movie: MovieSummary) => void;
  clear: () => void;
}

// Client state only (server data lives in TanStack Query). Persisted per browser, no account needed.
export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      movies: [],
      add: (movie) =>
        set((state) => ({ movies: addRecentMovie(state.movies, movie, RECENTLY_VIEWED_LIMIT) })),
      clear: () => set({ movies: [] }),
    }),
    {
      name: RECENTLY_VIEWED_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ movies: state.movies }),
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
