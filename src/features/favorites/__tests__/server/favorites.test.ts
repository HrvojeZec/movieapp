import { beforeEach, describe, expect, it, vi } from "vitest";

const findOneAndUpdate = vi.fn();
const findById = vi.fn();
const exists = vi.fn();

vi.mock("@/server/db/mongodb", () => ({ default: vi.fn() }));
vi.mock("@/server/activity", () => ({ logUserActivity: vi.fn() }));
vi.mock("@/server/models/User", () => ({
  default: {
    findOneAndUpdate: (...args: unknown[]) => findOneAndUpdate(...args),
    findById: (id: string) => ({ select: () => findById(id) }),
    exists: (filter: unknown) => exists(filter),
  },
}));

const { setFavorite } = await import("@/features/favorites/server/favorites");

const USER_ID = "507f1f77bcf86cd799439011";
const basic = { subscriptionStatus: "free", subscriptionPlan: "basic" };
const premium = { subscriptionStatus: "active", subscriptionPlan: "premium" };

describe("setFavorite", () => {
  beforeEach(() => {
    findOneAndUpdate.mockReset().mockResolvedValue({ favorites: ["550", "551"] });
    findById.mockReset().mockResolvedValue(basic);
    exists.mockReset().mockResolvedValue({ _id: USER_ID });
  });

  it("adds within the free plan's limit in one atomic update", async () => {
    await expect(setFavorite(USER_ID, "551", true)).resolves.toEqual(["550", "551"]);

    const [filter, update] = findOneAndUpdate.mock.calls[0];
    // The 20th slot must still be empty, unless the movie is already a favorite
    expect(filter).toEqual({
      _id: USER_ID,
      $or: [{ favorites: "551" }, { "favorites.19": { $exists: false } }],
    });
    expect(update).toEqual({ $addToSet: { favorites: "551" } });
  });

  it("a free user can't add a 21st favorite", async () => {
    findOneAndUpdate.mockResolvedValue(null);

    await expect(setFavorite(USER_ID, "999", true)).rejects.toMatchObject({
      status: 403,
      message:
        "The free plan allows up to 20 favorites. Upgrade to Premium for unlimited favorites.",
    });
  });

  it("premium has no limit", async () => {
    findById.mockResolvedValue(premium);

    await setFavorite(USER_ID, "999", true);

    expect(findOneAndUpdate.mock.calls[0][0]).toEqual({ _id: USER_ID });
  });

  it("a canceled subscription counts as the free plan", async () => {
    findById.mockResolvedValue({ subscriptionStatus: "canceled", subscriptionPlan: "premium" });

    await setFavorite(USER_ID, "999", true);

    expect(findOneAndUpdate.mock.calls[0][0]).toHaveProperty("$or");
  });

  it("removing is always allowed, even over the limit", async () => {
    await setFavorite(USER_ID, "550", false);

    const [filter, update] = findOneAndUpdate.mock.calls[0];
    expect(filter).toEqual({ _id: USER_ID });
    expect(update).toEqual({ $pull: { favorites: "550" } });
    expect(findById).not.toHaveBeenCalled();
  });

  it("answers 404 for a user that no longer exists", async () => {
    findById.mockResolvedValue(null);

    await expect(setFavorite(USER_ID, "999", true)).rejects.toMatchObject({ status: 404 });
  });
});
