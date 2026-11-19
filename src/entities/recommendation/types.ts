import type { MovieSummary } from "@/entities/movie/types";

export type RecommendedMovie = MovieSummary & {
  /** Why it's recommended, e.g. "Because you liked Fight Club". */
  reason: string;
};

export interface RecommendationsResult {
  results: RecommendedMovie[];
  /** True when there was nothing to go on yet: the results are popular movies. */
  coldStart: boolean;
}
