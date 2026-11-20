import { beforeEach, describe, expect, it, vi } from "vitest";

const aggregate = vi.fn();
const updateMany = vi.fn();
const fetchGenreIdsOrThrow = vi.fn();

vi.mock("@/server/db/mongodb", () => ({ default: vi.fn() }));
vi.mock("@/server/models/WatchedMovie", () => ({
  default: {
    aggregate: (...args: unknown[]) => aggregate(...args),
    updateMany: (...args: unknown[]) => updateMany(...args),
  },
}));
vi.mock("@/entities/movie/server/genre-ids", () => ({
  fetchGenreIdsOrThrow: (movieId: string) => fetchGenreIdsOrThrow(movieId),
}));

const { refreshStaleWatchedGenres } = await import("@/entities/watched/server/refresh-genres");

const NOW = new Date("2026-11-20T06:00:00Z");
// 180 days before NOW: TMDB's terms allow keeping its data for 6 months
const CUTOFF = new Date("2026-05-24T06:00:00Z");

const updateFor = (movieId: string) =>
  updateMany.mock.calls.find(([filter]) => filter.movieId === movieId);

describe("refreshStaleWatchedGenres", () => {
  beforeEach(() => {
    aggregate.mockReset().mockResolvedValue([{ _id: "550" }, { _id: "680" }]);
    updateMany.mockReset().mockResolvedValue({ modifiedCount: 1 });
    fetchGenreIdsOrThrow.mockReset().mockResolvedValue([18, 53]);
  });

  it("finds the movies whose genres are older than 180 days, a bounded number a day", async () => {
    await refreshStaleWatchedGenres(NOW);

    const [pipeline] = aggregate.mock.calls[0];
    expect(pipeline[0].$match).toEqual({
      "genreIds.0": { $exists: true },
      $or: [
        { genresUpdatedAt: { $lt: CUTOFF } },
        { genresUpdatedAt: { $exists: false }, watchedAt: { $lt: CUTOFF } },
      ],
    });
    expect(pipeline).toContainEqual({ $group: { _id: "$movieId" } });
    expect(pipeline.at(-1)).toEqual({ $limit: 200 });
  });

  it("stores fresh genres with today's date, once per movie for every user", async () => {
    await expect(refreshStaleWatchedGenres(NOW)).resolves.toEqual({
      movies: 2,
      refreshed: 2,
      failed: 0,
    });

    const [filter, update] = updateFor("550")!;
    expect(filter).toMatchObject({ movieId: "550", "genreIds.0": { $exists: true } });
    expect(update).toEqual({ $set: { genreIds: [18, 53], genresUpdatedAt: NOW } });
  });

  it("drops the genres of a movie TMDB no longer has", async () => {
    fetchGenreIdsOrThrow.mockImplementation(async (id: string) => (id === "680" ? null : [18]));

    await refreshStaleWatchedGenres(NOW);

    expect(updateFor("680")![1]).toEqual({ $set: { genreIds: [], genresUpdatedAt: NOW } });
  });

  it("leaves a movie for the next run when TMDB fails", async () => {
    fetchGenreIdsOrThrow.mockImplementation(async (id: string) => {
      if (id === "680") throw new Error("TMDB unavailable");
      return [18];
    });

    await expect(refreshStaleWatchedGenres(NOW)).resolves.toEqual({
      movies: 2,
      refreshed: 1,
      failed: 1,
    });
    expect(updateFor("680")).toBeUndefined();
  });
});
