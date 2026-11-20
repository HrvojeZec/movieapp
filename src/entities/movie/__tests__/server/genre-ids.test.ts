import { beforeEach, describe, expect, it, vi } from "vitest";
import { TmdbError } from "@/entities/movie/server/tmdb";

const fetchMovieDetails = vi.fn();

vi.mock("@/entities/movie/server/movies", () => ({
  fetchMovieDetails: (id: number) => fetchMovieDetails(id),
}));

const { fetchGenreIds, fetchGenreIdsOrThrow } = await import("@/entities/movie/server/genre-ids");

describe("fetchGenreIds", () => {
  beforeEach(() => {
    fetchMovieDetails.mockReset().mockResolvedValue({ genres: [{ id: 18 }, { id: 53 }] });
  });

  it("returns the movie's TMDB genre IDs", async () => {
    await expect(fetchGenreIds("550")).resolves.toEqual([18, 53]);
    expect(fetchMovieDetails).toHaveBeenCalledWith(550);
  });

  it("returns null for a movie TMDB doesn't know", async () => {
    fetchMovieDetails.mockRejectedValue(new TmdbError("not found", 404));

    await expect(fetchGenreIds("999999999")).resolves.toBeNull();
  });

  it("returns no genres when TMDB is down", async () => {
    fetchMovieDetails.mockRejectedValue(new TmdbError("unavailable", 503));
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(fetchGenreIds("550")).resolves.toEqual([]);
  });
});

describe("fetchGenreIdsOrThrow", () => {
  beforeEach(() => {
    fetchMovieDetails.mockReset().mockResolvedValue({ genres: [{ id: 18 }] });
  });

  it("returns the genre IDs, or null for a movie TMDB doesn't know", async () => {
    await expect(fetchGenreIdsOrThrow("550")).resolves.toEqual([18]);

    fetchMovieDetails.mockRejectedValue(new TmdbError("not found", 404));
    await expect(fetchGenreIdsOrThrow("999999999")).resolves.toBeNull();
  });

  it("fails when TMDB fails, so a caller can try again later", async () => {
    fetchMovieDetails.mockRejectedValue(new TmdbError("unavailable", 503));

    await expect(fetchGenreIdsOrThrow("550")).rejects.toThrow("unavailable");
  });
});
