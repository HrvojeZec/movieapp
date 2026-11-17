import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchCurrentUser } from "@/features/auth/api/auth.api";

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
