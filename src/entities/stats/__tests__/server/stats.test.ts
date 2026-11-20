import { beforeEach, describe, expect, it, vi } from "vitest";

// A Mongoose query stand-in: every builder method chains, lean() resolves the result
const query = (result: unknown) => {
  const chain: Record<string, unknown> = new Proxy(
    {},
    { get: (_, prop) => (prop === "lean" ? () => Promise.resolve(result) : () => chain) },
  );
  return chain;
};

const db = {
  user: null as unknown,
  watched: [] as unknown[],
  views: [] as unknown[],
  lists: 0,
};
const fetchGenreIds = vi.fn();
const fetchGenres = vi.fn();
const activityFind = vi.fn();

vi.mock("@/server/db/mongodb", () => ({ default: vi.fn() }));
vi.mock("@/server/models/User", () => ({ default: { findById: () => query(db.user) } }));
vi.mock("@/server/models/WatchedMovie", () => ({ default: { find: () => query(db.watched) } }));
vi.mock("@/server/models/MovieList", () => ({
  default: { countDocuments: async () => db.lists },
}));
vi.mock("@/server/models/UserActivity", () => ({
  default: {
    find: (filter: unknown) => {
      activityFind(filter);
      return query(db.views);
    },
  },
}));
vi.mock("@/entities/movie/server/genre-ids", () => ({
  fetchGenreIds: (id: string) => fetchGenreIds(id),
}));
vi.mock("@/entities/movie/server/movies", () => ({ fetchGenres: () => fetchGenres() }));

const { getUserStats } = await import("@/entities/stats/server/stats");

const USER_ID = "507f1f77bcf86cd799439011";
const NOW = new Date("2026-11-18T12:00:00Z");

describe("getUserStats", () => {
  beforeEach(() => {
    db.user = { favorites: ["550", "13"], watchlist: ["680"] };
    db.watched = [
      { movieId: "550", genreIds: [18], watchedAt: new Date("2026-11-02T10:00:00Z") },
      { movieId: "807", genreIds: [53, 18], watchedAt: new Date("2026-10-02T10:00:00Z") },
      { movieId: "1", genreIds: [35], watchedAt: new Date("2024-01-01T10:00:00Z") },
    ];
    db.views = [{ createdAt: new Date("2026-11-10T10:00:00Z") }];
    db.lists = 2;
    activityFind.mockReset();
    fetchGenreIds.mockReset().mockImplementation(async (id: string) => (id === "13" ? [35] : [18]));
    fetchGenres.mockReset().mockResolvedValue([
      { id: 18, name: "Drama" },
      { id: 35, name: "Comedy" },
      { id: 53, name: "Thriller" },
    ]);
  });

  it("totals the user's movies and counts genres across watched movies and favorites", async () => {
    const stats = await getUserStats(USER_ID, NOW);

    expect(stats.totals).toEqual({ watched: 3, favorites: 2, watchlist: 1, lists: 2 });
    // 550 is watched and a favorite but counts once; the tie is broken by name
    expect(stats.topGenres).toEqual([
      { id: 35, name: "Comedy", count: 2 },
      { id: 18, name: "Drama", count: 2 },
      { id: 53, name: "Thriller", count: 1 },
    ]);
  });

  it("groups the last 12 months of watched movies and page views", async () => {
    // Views are read for a year of days; the monthly chart still shows 12 calendar months
    const { activityByMonth } = await getUserStats(USER_ID, NOW);

    expect(activityByMonth).toHaveLength(12);
    expect(activityByMonth.at(-1)).toEqual({ month: "2026-11", watched: 1, views: 1 });
    expect(activityByMonth.at(-2)).toEqual({ month: "2026-10", watched: 1, views: 0 });
    expect(activityFind).toHaveBeenCalledWith({
      userId: USER_ID,
      action: "view",
      createdAt: { $gte: new Date("2025-11-19T00:00:00Z") },
    });
  });

  it("returns daily activity, streaks and recently watched", async () => {
    db.watched = [
      { movieId: "550", genreIds: [18], watchedAt: new Date("2026-11-16T10:00:00Z") },
      { movieId: "807", genreIds: [53], watchedAt: new Date("2026-11-17T10:00:00Z") },
      { movieId: "1", genreIds: [35], watchedAt: new Date("2024-01-01T10:00:00Z") },
      ...Array.from({ length: 8 }, (_, index) => ({
        movieId: String(100 + index),
        genreIds: [],
        watchedAt: new Date(Date.UTC(2026, 5, index + 1, 10)),
      })),
    ];
    db.views = [
      { createdAt: new Date("2026-11-17T20:00:00Z") },
      { createdAt: new Date("2026-11-18T08:00:00Z") },
    ];

    const stats = await getUserStats(USER_ID, NOW);

    expect(stats.activityByDay.slice(-3)).toEqual([
      { date: "2026-11-16", watched: 1, views: 0 },
      { date: "2026-11-17", watched: 1, views: 1 },
      { date: "2026-11-18", watched: 0, views: 1 },
    ]);
    // 2024 is outside the year of days
    expect(stats.activityByDay.some((day) => day.date.startsWith("2024"))).toBe(false);
    // June 1–8 are eight days in a row
    expect(stats.streak).toEqual({ current: 3, longest: 8 });
    expect(stats.recentWatched).toEqual(["807", "550", "107", "106", "105", "104", "103", "102"]);
  });

  it("only looks up the genres of favorites that aren't watched", async () => {
    await getUserStats(USER_ID, NOW);

    expect(fetchGenreIds).toHaveBeenCalledTimes(1);
    expect(fetchGenreIds).toHaveBeenCalledWith("13");
  });

  it("answers 404 for a user that no longer exists", async () => {
    db.user = null;

    await expect(getUserStats(USER_ID, NOW)).rejects.toMatchObject({ status: 404 });
  });
});
