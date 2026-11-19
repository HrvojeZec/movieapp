import { beforeEach, describe, expect, it, vi } from "vitest";
import { TmdbError } from "@/entities/movie/server/tmdb";

const fetchMovieDetails = vi.fn();
const userUpdateOne = vi.fn();
const watchedUpdateOne = vi.fn();
const watchedDeleteOne = vi.fn();
const watchedFind = vi.fn();
const watchedCount = vi.fn();
const watchedDistinct = vi.fn();
const logUserActivity = vi.fn();

vi.mock("@/server/db/mongodb", () => ({ default: vi.fn() }));
vi.mock("@/server/activity", () => ({
  logUserActivity: (...args: unknown[]) => logUserActivity(...args),
}));
vi.mock("@/entities/movie/server/movies", () => ({
  fetchMovieDetails: (id: number) => fetchMovieDetails(id),
}));
vi.mock("@/server/models/User", () => ({
  default: { updateOne: (...args: unknown[]) => userUpdateOne(...args) },
}));
vi.mock("@/server/models/WatchedMovie", () => ({
  default: {
    updateOne: (...args: unknown[]) => watchedUpdateOne(...args),
    deleteOne: (...args: unknown[]) => watchedDeleteOne(...args),
    countDocuments: (...args: unknown[]) => watchedCount(...args),
    distinct: (...args: unknown[]) => watchedDistinct(...args),
    find: (filter: unknown) => {
      const query = {
        sort: (sort: unknown) => {
          watchedFind("sort", sort);
          return query;
        },
        skip: (skip: number) => {
          watchedFind("skip", skip);
          return query;
        },
        limit: (limit: number) => {
          watchedFind("limit", limit);
          return query;
        },
        select: () => query,
        lean: () => watchedFind("lean", filter),
      };
      return query;
    },
  },
}));

const { listWatched, listWatchedIds, markWatched, unmarkWatched } =
  await import("@/entities/watched/server/watched");

const USER_ID = "507f1f77bcf86cd799439011";
const WATCHED_AT = new Date("2026-11-18T10:00:00Z");

describe("markWatched", () => {
  beforeEach(() => {
    fetchMovieDetails.mockReset().mockResolvedValue({ genres: [{ id: 18 }, { id: 53 }] });
    userUpdateOne.mockReset().mockResolvedValue({ matchedCount: 1 });
    watchedUpdateOne.mockReset().mockResolvedValue({ upsertedCount: 1 });
    logUserActivity.mockReset();
  });

  it("stores the movie with its genres and logs it", async () => {
    await markWatched(USER_ID, "550");

    const [filter, update, options] = watchedUpdateOne.mock.calls[0];
    expect(filter).toEqual({ userId: USER_ID, movieId: "550" });
    expect(update.$setOnInsert).toMatchObject({ genreIds: [18, 53] });
    expect(update.$setOnInsert.watchedAt).toBeInstanceOf(Date);
    expect(options).toEqual({ upsert: true });
    expect(logUserActivity).toHaveBeenCalledWith(USER_ID, "watched", "550", undefined, {
      genreIds: [18, 53],
    });
  });

  it("marking watched removes the movie from the watchlist", async () => {
    await markWatched(USER_ID, "550");

    expect(userUpdateOne).toHaveBeenCalledWith({ _id: USER_ID }, { $pull: { watchlist: "550" } });
  });

  it("marking twice keeps one entry", async () => {
    watchedUpdateOne.mockResolvedValue({ upsertedCount: 0 });

    await markWatched(USER_ID, "550");

    // The upsert matched the existing entry: nothing new to log, and the first date is kept
    expect(logUserActivity).not.toHaveBeenCalled();
  });

  it("two requests at once still end with one entry", async () => {
    watchedUpdateOne.mockRejectedValue(Object.assign(new Error("E11000"), { code: 11000 }));

    await expect(markWatched(USER_ID, "550")).resolves.toBeUndefined();
    expect(logUserActivity).not.toHaveBeenCalled();
  });

  it("answers 404 for a movie TMDB doesn't know", async () => {
    fetchMovieDetails.mockRejectedValue(new TmdbError("not found", 404));

    await expect(markWatched(USER_ID, "999999999")).rejects.toMatchObject({ status: 404 });
    expect(watchedUpdateOne).not.toHaveBeenCalled();
  });

  it("still records the movie when TMDB is down, without genres", async () => {
    fetchMovieDetails.mockRejectedValue(new TmdbError("unavailable", 503));
    vi.spyOn(console, "error").mockImplementation(() => {});

    await markWatched(USER_ID, "550");

    expect(watchedUpdateOne.mock.calls[0][1].$setOnInsert.genreIds).toEqual([]);
  });

  it("answers 404 for a user that no longer exists", async () => {
    userUpdateOne.mockResolvedValue({ matchedCount: 0 });

    await expect(markWatched(USER_ID, "550")).rejects.toMatchObject({ status: 404 });
    expect(watchedUpdateOne).not.toHaveBeenCalled();
  });
});

describe("unmarkWatched", () => {
  beforeEach(() => {
    watchedDeleteOne.mockReset().mockResolvedValue({ deletedCount: 1 });
    logUserActivity.mockReset();
  });

  it("removes the entry and logs it", async () => {
    await unmarkWatched(USER_ID, "550");

    expect(watchedDeleteOne).toHaveBeenCalledWith({ userId: USER_ID, movieId: "550" });
    expect(logUserActivity).toHaveBeenCalledWith(USER_ID, "unwatched", "550");
  });

  it("does nothing for a movie that wasn't watched", async () => {
    watchedDeleteOne.mockResolvedValue({ deletedCount: 0 });

    await unmarkWatched(USER_ID, "550");

    expect(logUserActivity).not.toHaveBeenCalled();
  });
});

describe("listWatched", () => {
  beforeEach(() => {
    watchedFind
      .mockReset()
      .mockImplementation((step: string) =>
        step === "lean" ? Promise.resolve([{ movieId: "550", watchedAt: WATCHED_AT }]) : undefined,
      );
    watchedCount.mockReset().mockResolvedValue(45);
  });

  it("returns one page, newest first", async () => {
    await expect(listWatched(USER_ID, 2)).resolves.toEqual({
      results: [{ movieId: "550", watchedAt: WATCHED_AT.toISOString() }],
      page: 2,
      totalPages: 3,
      total: 45,
    });

    expect(watchedFind).toHaveBeenCalledWith("sort", { watchedAt: -1, _id: -1 });
    expect(watchedFind).toHaveBeenCalledWith("skip", 20);
    expect(watchedFind).toHaveBeenCalledWith("limit", 20);
    expect(watchedFind).toHaveBeenCalledWith("lean", { userId: USER_ID });
  });

  it("an empty history has no pages", async () => {
    watchedCount.mockResolvedValue(0);
    watchedFind.mockImplementation((step: string) =>
      step === "lean" ? Promise.resolve([]) : undefined,
    );

    await expect(listWatched(USER_ID, 1)).resolves.toEqual({
      results: [],
      page: 1,
      totalPages: 0,
      total: 0,
    });
  });
});

describe("listWatchedIds", () => {
  it("returns every watched movie ID", async () => {
    watchedDistinct.mockResolvedValue(["550", "680"]);

    await expect(listWatchedIds(USER_ID)).resolves.toEqual(["550", "680"]);
    expect(watchedDistinct).toHaveBeenCalledWith("movieId", { userId: USER_ID });
  });
});
