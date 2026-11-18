import { STATS_DAYS, STATS_MONTHS, TOP_GENRES_LIMIT } from "@/features/stats/constants";
import { DAY_MS } from "@/shared/lib/time";
import type { DayActivity, GenreCount, MonthActivity, Streak } from "@/features/stats/types";

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

type ActivityEvent = { kind: "watched" | "views"; at: Date };

const dayKey = (date: Date) => date.toISOString().slice(0, "YYYY-MM-DD".length);

const startOfUtcDay = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

/** The first moment of the oldest day `groupByDay` keeps, for querying the window. */
export const statsDayWindowStart = (now: Date, days = STATS_DAYS) =>
  new Date(startOfUtcDay(now).getTime() - (days - 1) * DAY_MS);

/** Counts per UTC day over the last `days` days; only days with activity, oldest first. */
export function groupByDay(events: ActivityEvent[], now: Date, days = STATS_DAYS): DayActivity[] {
  const start = statsDayWindowStart(now, days);
  const byDay = new Map<string, DayActivity>();
  for (const { kind, at } of events) {
    if (at < start || at > now) continue;
    const date = dayKey(at);
    const entry = byDay.get(date) ?? { date, watched: 0, views: 0 };
    entry[kind] += 1;
    byDay.set(date, entry);
  }
  return [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Runs of consecutive active days ("YYYY-MM-DD", UTC). The current run is still alive while its
 * last day is today or yesterday, so it doesn't drop to zero before today's first activity.
 */
export function computeStreak(activeDays: string[], now: Date): Streak {
  const days = [...new Set(activeDays)].sort();
  let longest = 0;
  let run = 0;
  let previous: number | null = null;
  for (const day of days) {
    const time = Date.parse(`${day}T00:00:00Z`);
    run = previous !== null && time - previous === DAY_MS ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = time;
  }
  const today = startOfUtcDay(now).getTime();
  const alive = previous !== null && today - previous <= DAY_MS;
  return { current: alive ? run : 0, longest };
}
