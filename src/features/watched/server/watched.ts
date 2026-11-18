import connectDB from "@/server/db/mongodb";
import User from "@/server/models/User";
import WatchedMovie from "@/server/models/WatchedMovie";
import { logUserActivity } from "@/server/activity";
import { notFound } from "@/server/http/route-error";
import { fetchGenreIds } from "@/features/movies/server/genre-ids";
import { WATCHED_PAGE_SIZE } from "@/features/watched/constants";
import type { WatchedPage } from "@/features/watched/types";

const DUPLICATE_KEY_ERROR = 11000;

const isDuplicateKeyError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === DUPLICATE_KEY_ERROR;

/** Marks a movie as watched (once; the first date is kept) and takes it off the watchlist. */
export async function markWatched(userId: string, movieId: string): Promise<void> {
  const genreIds = await fetchGenreIds(movieId);
  if (genreIds === null) throw notFound("Movie");
  await connectDB();

  // Watched means there's nothing left to watch later
  const { matchedCount } = await User.updateOne({ _id: userId }, { $pull: { watchlist: movieId } });
  if (matchedCount === 0) throw notFound("User");

  let added: boolean;
  try {
    const { upsertedCount } = await WatchedMovie.updateOne(
      { userId, movieId },
      { $setOnInsert: { watchedAt: new Date(), genreIds } },
      { upsert: true },
    );
    added = upsertedCount > 0;
  } catch (error) {
    // Two requests at once both try to insert: the unique index keeps one, which is the goal
    if (!isDuplicateKeyError(error)) throw error;
    added = false;
  }

  if (added) await logUserActivity(userId, "watched", movieId, undefined, { genreIds });
}

export async function unmarkWatched(userId: string, movieId: string): Promise<void> {
  await connectDB();
  const { deletedCount } = await WatchedMovie.deleteOne({ userId, movieId });
  if (deletedCount > 0) await logUserActivity(userId, "unwatched", movieId);
}

/** One page of the history, newest first. */
export async function listWatched(userId: string, page: number): Promise<WatchedPage> {
  await connectDB();
  const [entries, total] = await Promise.all([
    WatchedMovie.find({ userId })
      .sort({ watchedAt: -1, _id: -1 })
      .skip((page - 1) * WATCHED_PAGE_SIZE)
      .limit(WATCHED_PAGE_SIZE)
      .select({ movieId: 1, watchedAt: 1 })
      .lean(),
    WatchedMovie.countDocuments({ userId }),
  ]);

  return {
    results: entries.map(({ movieId, watchedAt }) => ({
      movieId,
      watchedAt: watchedAt.toISOString(),
    })),
    page,
    totalPages: Math.ceil(total / WATCHED_PAGE_SIZE),
    total,
  };
}

/** All watched movie IDs, for marking cards; just strings, so even a long history stays small. */
export async function listWatchedIds(userId: string): Promise<string[]> {
  await connectDB();
  return WatchedMovie.distinct("movieId", { userId });
}
