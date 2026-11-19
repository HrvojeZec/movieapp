import { beforeEach, describe, expect, it, vi } from "vitest";

const updateMany = vi.fn();

vi.mock("@/server/db/mongodb", () => ({ default: vi.fn() }));
vi.mock("@/server/models/UserActivity", () => ({
  default: { updateMany: (...args: unknown[]) => updateMany(...args) },
}));

const { purgeActivityGenres } = await import("@/server/activity");

describe("purgeActivityGenres", () => {
  beforeEach(() => {
    updateMany.mockReset().mockResolvedValue({ modifiedCount: 4 });
  });

  it("removes the TMDB genres older versions stored with activity", async () => {
    await expect(purgeActivityGenres()).resolves.toBe(4);

    expect(updateMany).toHaveBeenCalledWith(
      { "metadata.genreIds": { $exists: true } },
      { $unset: { "metadata.genreIds": "" } },
    );
  });
});
