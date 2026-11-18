import { STATS_MONTHS, TOP_GENRES_LIMIT } from "@/features/stats/constants";
import type { GenreCount, MonthActivity } from "@/features/stats/types";

/**
 * How many of the user's movies have each genre, most first (ties by name). A movie that is both
 * watched and a favorite counts once; genres TMDB has no name for are skipped.
 */
export function countTopGenres(
  movies: { movieId: string; genreIds: number[] }[],
  genreNames: Map<number, string>,
  limit = TOP_GENRES_LIMIT,
): GenreCount[] {
  const genresByMovie = new Map(movies.map(({ movieId, genreIds }) => [movieId, genreIds]));
  const counts = new Map<number, number>();
  for (const genreIds of genresByMovie.values()) {
    for (const id of new Set(genreIds)) counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  return [...counts]
    .flatMap(([id, count]) => {
      const name = genreNames.get(id);
      return name ? [{ id, name, count }] : [];
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);
}

const monthKey = (date: Date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;

/** Counts per calendar month (UTC) for the last `months` months, oldest first, gaps as zeros. */
export function groupByMonth(
  events: { kind: "watched" | "views"; at: Date }[],
  now: Date,
  months = STATS_MONTHS,
): MonthActivity[] {
  const result: MonthActivity[] = Array.from({ length: months }, (_, index) => ({
    month: monthKey(
      new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1 - index), 1)),
    ),
    watched: 0,
    views: 0,
  }));
  const byMonth = new Map(result.map((entry) => [entry.month, entry]));

  for (const { kind, at } of events) {
    const entry = byMonth.get(monthKey(at));
    if (entry) entry[kind] += 1;
  }
  return result;
}

/** The first moment of the oldest month `groupByMonth` shows, for querying the window. */
export const statsWindowStart = (now: Date, months = STATS_MONTHS) =>
  new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1));
