import connectDB from "@/server/db/mongodb";
import WatchedMovie from "@/server/models/WatchedMovie";
import { TMDB_DATA_MAX_AGE_DAYS } from "@/entities/movie/constants";
import { fetchGenreIdsOrThrow } from "@/entities/movie/server/genre-ids";
import { GENRE_REFRESH_BATCH, GENRE_REFRESH_LIMIT } from "@/entities/watched/constants";
import { DAY_MS } from "@/shared/lib/time";

export interface GenreRefreshResult {
  movies: number;
  refreshed: number;
  failed: number;
}

/**
 * Looks up again the genres stored with watched movies once they are older than TMDB allows its
 * data to be kept (6 months), one TMDB call per movie for every user who watched it. A movie TMDB
 * no longer has loses its genres; one TMDB fails on is left for the next run.
 */
export async function refreshStaleWatchedGenres(now: Date): Promise<GenreRefreshResult> {
  const cutoff = new Date(now.getTime() - TMDB_DATA_MAX_AGE_DAYS * DAY_MS);
  // Empty genre lists hold nothing from TMDB, so they never need refreshing
  const stale = {
    "genreIds.0": { $exists: true },
    $or: [
      { genresUpdatedAt: { $lt: cutoff } },
      // Movies marked watched before the date was kept
      { genresUpdatedAt: { $exists: false }, watchedAt: { $lt: cutoff } },
    ],
  };

  await connectDB();
  const groups: { _id: string }[] = await WatchedMovie.aggregate([
    { $match: stale },
    { $group: { _id: "$movieId" } },
    { $limit: GENRE_REFRESH_LIMIT },
  ]);
  const movieIds = groups.map((group) => group._id);

  const result: GenreRefreshResult = { movies: movieIds.length, refreshed: 0, failed: 0 };
  for (let start = 0; start < movieIds.length; start += GENRE_REFRESH_BATCH) {
    const batch = movieIds.slice(start, start + GENRE_REFRESH_BATCH);
    const lookups = await Promise.allSettled(batch.map((movieId) => fetchGenreIdsOrThrow(movieId)));
    await Promise.all(
      lookups.map(async (lookup, index) => {
        if (lookup.status === "rejected") {
          result.failed += 1;
          return;
        }
        await WatchedMovie.updateMany(
          { movieId: batch[index], ...stale },
          { $set: { genreIds: lookup.value ?? [], genresUpdatedAt: now } },
        );
        result.refreshed += 1;
      }),
    );
  }
  return result;
}
