import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const refreshStaleWatchedGenres = vi.fn();
const purgeActivityGenres = vi.fn();
vi.mock("@/entities/watched/server/refresh-genres", () => ({
  refreshStaleWatchedGenres: (now: Date) => refreshStaleWatchedGenres(now),
}));
vi.mock("@/server/activity", () => ({
  purgeActivityGenres: () => purgeActivityGenres(),
}));

const { GET } = await import("@/app/api/cron/refresh-tmdb-data/route");

const call = (authorization?: string) =>
  GET(
    new NextRequest("https://movies.example.com/api/cron/refresh-tmdb-data", {
      headers: authorization ? { authorization } : {},
    }),
    // The route has no URL parameters
    undefined as never,
  );

describe("GET /api/cron/refresh-tmdb-data", () => {
  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", "s3cret-value-from-vercel");
    refreshStaleWatchedGenres.mockReset().mockResolvedValue({ movies: 3, refreshed: 2, failed: 1 });
    purgeActivityGenres.mockReset().mockResolvedValue(5);
  });

  it("rejects a request without the cron secret", async () => {
    const response = await call();

    expect(response.status).toBe(401);
    expect(refreshStaleWatchedGenres).not.toHaveBeenCalled();
    expect(purgeActivityGenres).not.toHaveBeenCalled();
  });

  it("refreshes old genres, clears stored activity genres and reports both", async () => {
    const response = await call("Bearer s3cret-value-from-vercel");

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    await expect(response.json()).resolves.toEqual({
      watchedGenres: { movies: 3, refreshed: 2, failed: 1 },
      activityGenresCleared: 5,
    });
  });
});
