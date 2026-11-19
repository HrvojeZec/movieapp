import { create } from "zustand";

interface ViewTransitionState {
  /** The card the user just opened (a per-card id, not the movie id). */
  activeCard: string | null;
  setActive: (cardId: string) => void;
}

/**
 * Which movie card the poster flies out of. Only that card names its poster for the transition:
 * the same movie can sit in two rows, and two elements with one transition name make the browser
 * skip the transition.
 */
export const useViewTransitionStore = create<ViewTransitionState>()((set) => ({
  activeCard: null,
  setActive: (cardId) => set({ activeCard: cardId }),
}));

/** The shared name of a movie's poster on its card and on its page. */
export const posterTransitionName = (movieId: number) => `movie-poster-${movieId}`;
