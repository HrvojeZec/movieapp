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
  watchedIds: [] as string[],
  lists: [] as unknown[],
  activity: [] as unknown[],
};
const tmdb = {
  fetchMovieDetails: vi.fn(),
  fetchMovieRecommendations: vi.fn(),
  fetchDiscover: vi.fn(),
  fetchGenres: vi.fn(),
  fetchMovieList: vi.fn(),
};

vi.mock("@/server/db/mongodb", () => ({ default: vi.fn() }));
vi.mock("@/server/models/User", () => ({ default: { findById: () => query(db.user) } }));
vi.mock("@/server/models/WatchedMovie", () => ({
  default: { find: () => query(db.watched), distinct: async () => db.watchedIds },
}));
vi.mock("@/server/models/MovieList", () => ({ default: { find: () => query(db.lists) } }));
vi.mock("@/server/models/UserActivity", () => ({ default: { find: () => query(db.activity) } }));
vi.mock("@/features/movies/server/movies", () => ({
  fetchMovieDetails: (id: number) => tmdb.fetchMovieDetails(id),
  fetchMovieRecommendations: (id: number) => tmdb.fetchMovieRecommendations(id),
  fetchDiscover: (filters: unknown) => tmdb.fetchDiscover(filters),
  fetchGenres: () => tmdb.fetchGenres(),
  fetchMovieList: (list: string) => tmdb.fetchMovieList(list),
}));

const { getRecommendations } = await import("@/features/recommendations/server/recommend");

const USER_ID = "507f1f77bcf86cd799439011";
const NOW = new Date("2026-11-18T12:00:00Z");
const DRAMA = 18;
const CRIME = 80;
const movie = (id: number, genreIds: number[], voteAverage = 7) => ({
  id,
  title: `Movie ${id}`,
  poster_path: null,
  release_date: "2020-01-01",
  vote_average: voteAverage,
  genre_ids: genreIds,
});

describe("getRecommendations", () => {
  beforeEach(() => {
    db.user = { favorites: [], watchlist: [], createdAt: new Date("2026-01-01") };
    db.watched = [];
    db.watchedIds = [];
    db.lists = [];
    db.activity = [];
    for (const fn of Object.values(tmdb)) fn.mockReset();
    tmdb.fetchMovieDetails.mockImplementation(async (id: number) => ({
      id,
      title: { 550: "Fight Club", 680: "Pulp Fiction" }[id] ?? `Movie ${id}`,
      genres: [{ id: id === 680 ? CRIME : DRAMA }],
    }));
    tmdb.fetchMovieRecommendations.mockResolvedValue([]);
    tmdb.fetchDiscover.mockResolvedValue({ results: [] });
    tmdb.fetchGenres.mockResolvedValue([
      { id: DRAMA, name: "Drama" },
      { id: CRIME, name: "Crime" },
    ]);
    tmdb.fetchMovieList.mockResolvedValue({ results: [movie(1, [DRAMA]), movie(2, [CRIME])] });
  });

  it("no signals means cold start", async () => {
    db.lists = [{ movieIds: ["2"] }];

    await expect(getRecommendations(USER_ID, NOW)).resolves.toEqual({
      coldStart: true,
      results: [expect.objectContaining({ id: 1, reason: "Popular right now" })],
    });
    expect(tmdb.fetchMovieList).toHaveBeenCalledWith("popular");
    expect(tmdb.fetchMovieRecommendations).not.toHaveBeenCalled();
  });

  it("recommends from favorites and watched movies, without what the user already has", async () => {
    db.user = { favorites: ["550"], watchlist: [], createdAt: new Date("2026-01-01") };
    db.watched = [{ movieId: "680", watchedAt: NOW, genreIds: [CRIME] }];
    db.watchedIds = ["680"];
    db.activity = [{ action: "favorite", movieId: "550", createdAt: NOW }];
    tmdb.fetchMovieRecommendations.mockImplementation(async (id: number) =>
      id === 550
        ? [movie(1, [DRAMA]), movie(680, [CRIME])]
        : [movie(1, [DRAMA]), movie(3, [CRIME])],
    );
    tmdb.fetchDiscover.mockResolvedValue({ results: [movie(4, [DRAMA], 8)] });

    const { coldStart, results } = await getRecommendations(USER_ID, NOW);

    expect(coldStart).toBe(false);
    expect(tmdb.fetchMovieRecommendations).toHaveBeenCalledWith(550);
    expect(tmdb.fetchMovieRecommendations).toHaveBeenCalledWith(680);
    // Recommended by both seeds, so first; the watched movie itself is left out
    expect(results[0]).toMatchObject({ id: 1, reason: "Because you liked Fight Club" });
    expect(results.map((result) => result.id)).not.toContain(680);
    expect(results).toContainEqual(
      expect.objectContaining({ id: 3, reason: "Because you watched Pulp Fiction" }),
    );
    expect(results).toContainEqual(expect.objectContaining({ id: 4, reason: expect.any(String) }));
  });

  it("asks TMDB for the user's strongest genres by rating", async () => {
    db.user = { favorites: ["550"], watchlist: [], createdAt: new Date("2026-01-01") };

    await getRecommendations(USER_ID, NOW);

    expect(tmdb.fetchDiscover).toHaveBeenCalledWith(
      expect.objectContaining({ genres: [DRAMA], sortBy: "vote_average.desc" }),
    );
  });

  it("a failing TMDB call doesn't sink the other sources", async () => {
    db.user = { favorites: ["550"], watchlist: [], createdAt: new Date("2026-01-01") };
    db.watched = [{ movieId: "680", watchedAt: NOW, genreIds: [CRIME] }];
    tmdb.fetchMovieRecommendations.mockImplementation(async (id: number) => {
      if (id === 550) throw new Error("TMDB is down");
      return [movie(3, [CRIME])];
    });

    const { results } = await getRecommendations(USER_ID, NOW);

    expect(results.map((result) => result.id)).toContain(3);
  });

  it("answers 404 for a user that no longer exists", async () => {
    db.user = null;

    await expect(getRecommendations(USER_ID, NOW)).rejects.toMatchObject({ status: 404 });
  });
});
