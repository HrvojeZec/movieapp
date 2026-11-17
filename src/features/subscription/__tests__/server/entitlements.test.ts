import { beforeEach, describe, expect, it, vi } from "vitest";

const findById = vi.fn();
vi.mock("@/server/db/mongodb", () => ({ default: vi.fn() }));
vi.mock("@/server/models/User", () => ({ default: { findById: (id: string) => findById(id) } }));

const { requireFeature } = await import("@/features/subscription/server/entitlements");

const user = (subscriptionStatus?: string, subscriptionPlan?: string) => ({
  _id: "user-1",
  subscriptionStatus,
  subscriptionPlan,
});

describe("requireFeature", () => {
  beforeEach(() => findById.mockReset());

  it("returns the user when their plan includes the feature", async () => {
    const premium = user("active", "premium");
    findById.mockResolvedValue(premium);

    await expect(requireFeature("user-1", "watchlist")).resolves.toBe(premium);
  });

  it("answers 403 and names the plan the feature needs", async () => {
    findById.mockResolvedValue(user("active", "premium"));

    await expect(requireFeature("user-1", "recommendations")).rejects.toMatchObject({
      status: 403,
      message: "Recommendations requires the Pro plan",
    });
  });

  it("answers 403 for a canceled subscription", async () => {
    findById.mockResolvedValue(user("canceled", "pro"));

    await expect(requireFeature("user-1", "watchlist")).rejects.toMatchObject({
      status: 403,
      message: "Watchlist requires the Premium plan",
    });
  });

  it("answers 404 when the user no longer exists", async () => {
    findById.mockResolvedValue(null);

    await expect(requireFeature("user-1", "watchlist")).rejects.toMatchObject({ status: 404 });
  });
});
