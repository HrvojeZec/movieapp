import {
  FALLBACK_REASON,
  MAX_COUNTED_SEEDS,
  RECOMMENDATION_LIMIT,
  SCORE_WEIGHTS,
} from "@/entities/recommendation/constants";
import type { RecommendedMovie } from "@/entities/recommendation/types";
import type { MovieSummary } from "@/entities/movie/types";
import { MAX_RATING } from "@/entities/movie/constants";

export type CandidateMovie = MovieSummary & { genre_ids: number[] };

/** A movie of the user's that TMDB's recommendations were based on. */
export interface Seed {
  title: string;
  kind: "liked" | "watched";
}

export interface Candidate {
  movie: CandidateMovie;
  /** Strongest first: the first one explains the recommendation. */
  seeds: Seed[];
}

/** A batch of candidate movies, and the seed it came from (none for genre-based ones). */
export interface CandidateSource {
  movies: CandidateMovie[];
  seed?: Seed;
}

/** One candidate per movie, keeping every seed that recommended it, in source order. */
export function collectCandidates(sources: CandidateSource[]): Candidate[] {
  const byId = new Map<number, Candidate>();
  for (const { movies, seed } of sources) {
    for (const movie of movies) {
      const candidate = byId.get(movie.id) ?? { movie, seeds: [] };
      if (seed) candidate.seeds.push(seed);
      byId.set(movie.id, candidate);
    }
  }
  return [...byId.values()];
}

function explain(
  candidate: Candidate,
  profile: Map<number, number>,
  genreNames: Map<number, string>,
) {
  const [seed] = candidate.seeds;
  if (seed) return `Because you ${seed.kind} ${seed.title}`;

  const topGenre = candidate.movie.genre_ids
    .filter((genreId) => profile.has(genreId) && genreNames.has(genreId))
    .sort((a, b) => profile.get(b)! - profile.get(a)!)[0];
  return topGenre === undefined ? FALLBACK_REASON : `Because you like ${genreNames.get(topGenre)}`;
}

/**
 * Ranks candidates by how many seeds recommend them, how well their genres match the profile and
 * their rating; drops movies the user already has, and says why each one is there.
 */
export function scoreCandidates(
  candidates: Candidate[],
  profile: Map<number, number>,
  exclude: Set<number>,
  genreNames: Map<number, string>,
  limit = RECOMMENDATION_LIMIT,
): RecommendedMovie[] {
  return candidates
    .filter(({ movie }) => !exclude.has(movie.id))
    .map((candidate) => {
      const { movie, seeds } = candidate;
      const genreMatch = movie.genre_ids.reduce((sum, id) => sum + (profile.get(id) ?? 0), 0);
      const score =
        (SCORE_WEIGHTS.seeds * Math.min(seeds.length, MAX_COUNTED_SEEDS)) / MAX_COUNTED_SEEDS +
        SCORE_WEIGHTS.genreMatch * Math.min(genreMatch, 1) +
        (SCORE_WEIGHTS.rating * movie.vote_average) / MAX_RATING;
      return { candidate, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ candidate }) => {
      const { id, title, poster_path, release_date, vote_average } = candidate.movie;
      return {
        id,
        title,
        poster_path,
        release_date,
        vote_average,
        reason: explain(candidate, profile, genreNames),
      };
    });
}
