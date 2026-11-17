import { afterEach, describe, expect, it, vi } from "vitest";
import { HttpError } from "@/shared/lib/http";
import { applyFavoriteChange, fetchCurrentUser, toApiError } from "./queries";

describe("applyFavoriteChange", () => {
  it("adds a movie once", () => {
    expect(applyFavoriteChange(["1"], "2", true)).toEqual(["1", "2"]);
    expect(applyFavoriteChange(["1", "2"], "2", true)).toEqual(["1", "2"]);
  });

  it("removes a movie and ignores one that isn't there", () => {
    expect(applyFavoriteChange(["1", "2"], "1", false)).toEqual(["2"]);
    expect(applyFavoriteChange(["2"], "1", false)).toEqual(["2"]);
  });
});

describe("toApiError", () => {
  it("keeps the message and field errors from an API error response", () => {
    const errors = [{ field: "email", message: "Invalid email" }];
    const error = new HttpError(400, "Validation failed", { message: "Validation failed", errors });

    expect(toApiError(error)).toEqual({ message: "Validation failed", errors });
  });

  it("ignores a malformed errors field", () => {
    const error = new HttpError(400, "Bad request", { errors: "nope" });
    expect(toApiError(error)).toEqual({ message: "Bad request", errors: undefined });
  });

  it("hides details of unexpected errors", () => {
    expect(toApiError(new TypeError("Failed to fetch"))).toEqual({
      message: "An unexpected error occurred",
    });
  });
});

describe("fetchCurrentUser", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const respondWith = (response: Response) =>
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));

  it("returns the logged-in user", async () => {
    respondWith(Response.json({ user: { id: "u1", favorites: [] } }));
    await expect(fetchCurrentUser()).resolves.toMatchObject({ id: "u1" });
  });

  it.each([401, 404])("treats %i as logged out", async (status) => {
    respondWith(Response.json({ message: "Unauthorized" }, { status }));
    await expect(fetchCurrentUser()).resolves.toBeNull();
  });

  it("throws on server errors so the query can retry", async () => {
    respondWith(Response.json({ message: "Internal server error" }, { status: 500 }));
    await expect(fetchCurrentUser()).rejects.toThrow("Internal server error");
  });
});
