import { beforeEach, describe, expect, it, vi } from "vitest";

const exists = vi.fn();
const fetchGenreIds = vi.fn();
const logUserActivity = vi.fn();

vi.mock("@/server/db/mongodb", () => ({ default: vi.fn() }));
vi.mock("@/server/activity", () => ({
  logUserActivity: (...args: unknown[]) => logUserActivity(...args),
}));
vi.mock("@/server/models/UserActivity", () => ({
  default: { exists: (filter: unknown) => exists(filter) },
}));
vi.mock("@/entities/movie/server/genre-ids", () => ({
  fetchGenreIds: (movieId: string) => fetchGenreIds(movieId),
}));

const { recordMovieView } = await import("@/entities/movie/server/movie-views");

const USER_ID = "507f1f77bcf86cd799439011";
const NOW = new Date("2026-11-18T12:00:00Z");

describe("recordMovieView", () => {
  beforeEach(() => {
    exists.mockReset().mockResolvedValue(null);
    fetchGenreIds.mockReset().mockResolvedValue([18, 53]);
    logUserActivity.mockReset();
  });

  it("logs a view with the movie's genres", async () => {
    await expect(recordMovieView(USER_ID, "550", NOW)).resolves.toBe(true);

    expect(logUserActivity).toHaveBeenCalledWith(USER_ID, "view", "550", undefined, {
      genreIds: [18, 53],
    });
  });

  it("logs a view once per hour per movie", async () => {
    exists.mockResolvedValue({ _id: "earlier-view" });

    await expect(recordMovieView(USER_ID, "550", NOW)).resolves.toBe(false);

    expect(exists).toHaveBeenCalledWith({
      userId: USER_ID,
      action: "view",
      movieId: "550",
      createdAt: { $gte: new Date("2026-11-18T11:00:00Z") },
    });
    // Checked before TMDB, so repeated visits cost nothing
    expect(fetchGenreIds).not.toHaveBeenCalled();
    expect(logUserActivity).not.toHaveBeenCalled();
  });

  it("skips movies TMDB doesn't know", async () => {
    fetchGenreIds.mockResolvedValue(null);

    await expect(recordMovieView(USER_ID, "999999999", NOW)).resolves.toBe(false);
    expect(logUserActivity).not.toHaveBeenCalled();
  });
});
