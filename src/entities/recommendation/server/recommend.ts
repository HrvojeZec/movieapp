import connectDB from "@/server/db/mongodb";
import MovieList from "@/server/models/MovieList";
import User from "@/server/models/User";
import UserActivity from "@/server/models/UserActivity";
import WatchedMovie from "@/server/models/WatchedMovie";
import { notFound } from "@/server/http/route-error";
import {
  fetchDiscover,
  fetchGenres,
  fetchMovieDetails,
  fetchMovieList,
  fetchMovieRecommendations,
} from "@/entities/movie/server/movies";
import type { MovieDetails } from "@/entities/movie/types";
import {
  COLD_START_REASON,
  GENRE_DISCOVER_MIN_VOTES,
  MAX_SIGNALS_PER_SOURCE,
  RECOMMENDATION_LIMIT,
  SEEDS_PER_SOURCE,
  SIGNAL_WEIGHTS,
  TOP_GENRES_FOR_DISCOVER,
} from "@/entities/recommendation/constants";
import { buildGenreProfile, type TasteSignal } from "@/entities/recommendation/lib/genre-profile";
import {
  collectCandidates,
  scoreCandidates,
  type CandidateSource,
  type Seed,
} from "@/entities/recommendation/lib/score";
import type { RecommendationsResult } from "@/entities/recommendation/types";

// Hybrid recommendations: TMDB's "more like this" for the user's latest favorites and watched
// movies (what similar viewers liked), plus top-rated movies in their strongest genres (content),
// ranked by lib/score. Every TMDB call is cached for an hour, and a failing one only loses its
// own candidates.

const newestFirst = (ids: string[]) => ids.slice(-MAX_SIGNALS_PER_SOURCE).reverse();

const settledValue = <T>(result: PromiseSettledResult<T>, fallback: T): T =>
  result.status === "fulfilled" ? result.value : fallback;

async function loadDetails(movieIds: string[]): Promise<Map<string, MovieDetails>> {
  const results = await Promise.allSettled(movieIds.map((id) => fetchMovieDetails(Number(id))));
  return new Map(
    movieIds.flatMap((id, index) => {
      const result = results[index];
      return result.status === "fulfilled" ? [[id, result.value] as const] : [];
    }),
  );
}

async function coldStart(exclude: Set<number>): Promise<RecommendationsResult> {
  const popular = await fetchMovieList("popular");
  return {
    coldStart: true,
    results: popular.results
      .filter((movie) => !exclude.has(movie.id))
      .slice(0, RECOMMENDATION_LIMIT)
      .map(({ id, title, poster_path, release_date, vote_average }) => ({
        id,
        title,
        poster_path,
        release_date,
        vote_average,
        reason: COLD_START_REASON,
      })),
  };
}

export async function getRecommendations(
  userId: string,
  now = new Date(),
): Promise<RecommendationsResult> {
  await connectDB();
  const user = await User.findById(userId)
    .select({ favorites: 1, watchlist: 1, createdAt: 1 })
    .lean();
  if (!user) throw notFound("User");

  const [watched, watchedIds, lists, activity] = await Promise.all([
    WatchedMovie.find({ userId })
      .sort({ watchedAt: -1 })
      .limit(MAX_SIGNALS_PER_SOURCE)
      .select({ movieId: 1, watchedAt: 1, genreIds: 1 })
      .lean(),
    WatchedMovie.distinct("movieId", { userId }),
    MovieList.find({ userId }).select({ movieIds: 1 }).lean(),
    // When favorites and watchlist entries were added, newest first
    UserActivity.find({ userId, action: { $in: ["favorite", "watchlist_add"] } })
      .sort({ createdAt: -1 })
      .select({ action: 1, movieId: 1, createdAt: 1 })
      .lean(),
  ]);

  // Anything the user already has is no news to them
  const exclude = new Set(
    [
      ...user.favorites,
      ...user.watchlist,
      ...watchedIds,
      ...lists.flatMap((list) => list.movieIds),
    ].map(Number),
  );

  const favorites = newestFirst(user.favorites);
  const watchlist = newestFirst(user.watchlist);
  if (favorites.length === 0 && watchlist.length === 0 && watched.length === 0) {
    return coldStart(exclude);
  }

  const addedAt = new Map<string, Date>();
  for (const { action, movieId, createdAt } of activity) {
    const key = `${action}:${movieId}`;
    if (!addedAt.has(key)) addedAt.set(key, createdAt);
  }
  // Entries older than activity logging fall back to the account's age
  const whenAdded = (action: string, movieId: string) =>
    addedAt.get(`${action}:${movieId}`) ?? user.createdAt;

  const watchedSeeds = watched.slice(0, SEEDS_PER_SOURCE);
  const details = await loadDetails([
    ...new Set([...favorites, ...watchlist, ...watchedSeeds.map((entry) => entry.movieId)]),
  ]);
  const genresOf = (movieId: string) => details.get(movieId)?.genres.map((genre) => genre.id) ?? [];

  const signals: TasteSignal[] = [
    ...favorites.map((id) => ({
      genreIds: genresOf(id),
      weight: SIGNAL_WEIGHTS.favorite,
      at: whenAdded("favorite", id),
    })),
    ...watched.map((entry) => ({
      genreIds: entry.genreIds.length > 0 ? entry.genreIds : genresOf(entry.movieId),
      weight: SIGNAL_WEIGHTS.watched,
      at: entry.watchedAt,
    })),
    ...watchlist.map((id) => ({
      genreIds: genresOf(id),
      weight: SIGNAL_WEIGHTS.watchlist,
      at: whenAdded("watchlist_add", id),
    })),
  ];
  const profile = buildGenreProfile(signals, now);

  // Favorites say more than watched movies, so their seeds come first and explain shared picks
  const seeds: { movieId: string; seed: Seed }[] = [
    ...favorites.slice(0, SEEDS_PER_SOURCE).map((movieId) => ({ movieId, kind: "liked" as const })),
    ...watchedSeeds.map(({ movieId }) => ({ movieId, kind: "watched" as const })),
  ].flatMap(({ movieId, kind }) => {
    const title = details.get(movieId)?.title;
    return title ? [{ movieId, seed: { title, kind } }] : [];
  });
  const topGenres = [...profile]
    .sort(([, a], [, b]) => b - a)
    .slice(0, TOP_GENRES_FOR_DISCOVER)
    .map(([genreId]) => genreId);

  const [seeded, byGenre, genres] = await Promise.all([
    Promise.allSettled(seeds.map(({ movieId }) => fetchMovieRecommendations(Number(movieId)))),
    Promise.allSettled(
      topGenres.map((genreId) =>
        fetchDiscover({
          genres: [genreId],
          sortBy: "vote_average.desc",
          minVotes: GENRE_DISCOVER_MIN_VOTES,
        }),
      ),
    ),
    fetchGenres().catch(() => []),
  ]);

  const sources: CandidateSource[] = [
    ...seeds.map(({ seed }, index) => ({ movies: settledValue(seeded[index], []), seed })),
    ...byGenre.map((result) => ({ movies: settledValue(result, null)?.results ?? [] })),
  ];

  return {
    coldStart: false,
    results: scoreCandidates(
      collectCandidates(sources),
      profile,
      exclude,
      new Map(genres.map((genre) => [genre.id, genre.name])),
    ),
  };
}
