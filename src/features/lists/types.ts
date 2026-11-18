/** A list as the lists page shows it. Dates are ISO strings. */
export interface MovieListSummary {
  id: string;
  name: string;
  movieCount: number;
  /** The latest movies, for the card's posters. */
  coverMovieIds: string[];
  /** Whether the list holds the movie asked about, for the "Add to list" menu. */
  hasMovie?: boolean;
  updatedAt: string;
}

/** One list with all its movies, oldest first. Dates are ISO strings. */
export interface MovieListDetails {
  id: string;
  name: string;
  movieIds: string[];
  createdAt: string;
  updatedAt: string;
}
