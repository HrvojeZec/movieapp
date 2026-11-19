import { describe, expect, it } from "vitest";
import { buildGenreProfile } from "@/entities/recommendation/lib/genre-profile";
import { SIGNAL_WEIGHTS } from "@/entities/recommendation/constants";

const NOW = new Date("2026-11-18T12:00:00Z");
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);
const DRAMA = 18;
const THRILLER = 53;
const COMEDY = 35;

describe("buildGenreProfile", () => {
  it("recent signals weigh more than old ones", () => {
    const profile = buildGenreProfile(
      [
        { genreIds: [DRAMA], weight: SIGNAL_WEIGHTS.favorite, at: daysAgo(1) },
        { genreIds: [COMEDY], weight: SIGNAL_WEIGHTS.favorite, at: daysAgo(180) },
      ],
      NOW,
    );

    expect(profile.get(DRAMA)!).toBeGreaterThan(profile.get(COMEDY)!);
    // 180 days is two half-lives: a quarter of the weight
    expect(profile.get(COMEDY)! / profile.get(DRAMA)!).toBeCloseTo(0.25, 1);
  });

  it("favorites weigh more than the watchlist", () => {
    const profile = buildGenreProfile(
      [
        { genreIds: [DRAMA], weight: SIGNAL_WEIGHTS.favorite, at: NOW },
        { genreIds: [COMEDY], weight: SIGNAL_WEIGHTS.watchlist, at: NOW },
      ],
      NOW,
    );

    expect(profile.get(DRAMA)).toBeCloseTo(0.75);
    expect(profile.get(COMEDY)).toBeCloseTo(0.25);
  });

  it("splits a movie's weight across its genres and sums to 1", () => {
    const profile = buildGenreProfile(
      [
        { genreIds: [DRAMA, THRILLER], weight: SIGNAL_WEIGHTS.watched, at: NOW },
        { genreIds: [DRAMA], weight: SIGNAL_WEIGHTS.watched, at: NOW },
      ],
      NOW,
    );

    expect(profile.get(DRAMA)).toBeCloseTo(0.75);
    expect(profile.get(THRILLER)).toBeCloseTo(0.25);
    expect([...profile.values()].reduce((sum, weight) => sum + weight, 0)).toBeCloseTo(1);
  });

  it("is empty without signals or genres", () => {
    expect(buildGenreProfile([], NOW).size).toBe(0);
    expect(buildGenreProfile([{ genreIds: [], weight: 3, at: NOW }], NOW).size).toBe(0);
  });
});
