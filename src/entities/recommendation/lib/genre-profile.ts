import { SIGNAL_HALF_LIFE_DAYS } from "@/entities/recommendation/constants";
import { DAY_MS } from "@/shared/lib/time";

/** Something the user did with a movie that says what they like. */
export interface TasteSignal {
  genreIds: number[];
  /** SIGNAL_WEIGHTS for its kind */
  weight: number;
  at: Date;
}

/**
 * How much each genre matters to the user, from 0 to 1, summing to 1. Each signal's weight halves
 * every SIGNAL_HALF_LIFE_DAYS and is split across the movie's genres, so a movie with many genres
 * doesn't count more than one with a single genre.
 */
export function buildGenreProfile(signals: TasteSignal[], now: Date): Map<number, number> {
  const totals = new Map<number, number>();

  for (const { genreIds, weight, at } of signals) {
    if (genreIds.length === 0) continue;
    const ageDays = Math.max(0, (now.getTime() - at.getTime()) / DAY_MS);
    const decayed = weight * 0.5 ** (ageDays / SIGNAL_HALF_LIFE_DAYS);
    for (const genreId of genreIds) {
      totals.set(genreId, (totals.get(genreId) ?? 0) + decayed / genreIds.length);
    }
  }

  const sum = [...totals.values()].reduce((total, value) => total + value, 0);
  return new Map([...totals].map(([genreId, value]) => [genreId, value / sum]));
}
