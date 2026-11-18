export interface WatchedEntry {
  movieId: string;
  /** ISO date */
  watchedAt: string;
}

export interface WatchedPage {
  results: WatchedEntry[];
  page: number;
  totalPages: number;
  /** Watched movies in all pages. */
  total: number;
}
