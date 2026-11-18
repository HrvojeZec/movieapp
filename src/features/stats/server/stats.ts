import connectDB from "@/server/db/mongodb";
import MovieList from "@/server/models/MovieList";
import User from "@/server/models/User";
import UserActivity from "@/server/models/UserActivity";
import WatchedMovie from "@/server/models/WatchedMovie";
import { notFound } from "@/server/http/route-error";
import { fetchGenreIds } from "@/features/movies/server/genre-ids";
import { fetchGenres } from "@/features/movies/server/movies";
import { MAX_FAVORITES_FOR_GENRES } from "@/features/stats/constants";
import { countTopGenres, groupByMonth, statsWindowStart } from "@/features/stats/lib/stats";
import type { UserStats } from "@/features/stats/types";

/** The user's own numbers: totals, favorite genres and the last 12 months of activity. */
export async function getUserStats(userId: string, now = new Date()): Promise<UserStats> {
  await connectDB();
  const user = await User.findById(userId).select({ favorites: 1, watchlist: 1 }).lean();
  if (!user) throw notFound("User");

  const [watched, views, lists] = await Promise.all([
    // Watched movies carry their genres, so the whole history costs no TMDB call
    WatchedMovie.find({ userId }).select({ movieId: 1, genreIds: 1, watchedAt: 1 }).lean(),
    UserActivity.find({ userId, action: "view", createdAt: { $gte: statsWindowStart(now) } })
      .select({ createdAt: 1 })
      .lean(),
    MovieList.countDocuments({ userId }),
  ]);

  const watchedIds = new Set(watched.map((entry) => entry.movieId));
  const favoritesToLookUp = user.favorites
    .slice(-MAX_FAVORITES_FOR_GENRES)
    .filter((movieId) => !watchedIds.has(movieId));
  const [favoriteGenres, genres] = await Promise.all([
    Promise.all(favoritesToLookUp.map((movieId) => fetchGenreIds(movieId))),
    fetchGenres().catch(() => []),
  ]);

  return {
    totals: {
      watched: watched.length,
      favorites: user.favorites.length,
      watchlist: user.watchlist.length,
      lists,
    },
    topGenres: countTopGenres(
      [
        ...watched,
        ...favoritesToLookUp.map((movieId, index) => ({
          movieId,
          genreIds: favoriteGenres[index] ?? [],
        })),
      ],
      new Map(genres.map((genre) => [genre.id, genre.name])),
    ),
    activityByMonth: groupByMonth(
      [
        ...watched.map((entry) => ({ kind: "watched" as const, at: entry.watchedAt })),
        ...views.map((view) => ({ kind: "views" as const, at: view.createdAt })),
      ],
      now,
    ),
  };
}
