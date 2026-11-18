import { beforeEach, describe, expect, it, vi } from "vitest";

const requireFeature = vi.fn();
const findByIdAndUpdate = vi.fn();
const logUserActivity = vi.fn();

vi.mock("@/server/db/mongodb", () => ({ default: vi.fn() }));
vi.mock("@/server/activity", () => ({
  logUserActivity: (...args: unknown[]) => logUserActivity(...args),
}));
vi.mock("@/features/subscription/server/entitlements", () => ({
  requireFeature: (...args: unknown[]) => requireFeature(...args),
}));
vi.mock("@/server/models/User", () => ({
  default: { findByIdAndUpdate: (...args: unknown[]) => findByIdAndUpdate(...args) },
}));

const { setWatchlist } = await import("@/features/watchlist/server/watchlist");

const USER_ID = "507f1f77bcf86cd799439011";
const forbidden = Object.assign(new Error("Watchlist requires the Premium plan"), { status: 403 });

describe("setWatchlist", () => {
  beforeEach(() => {
    requireFeature.mockReset().mockResolvedValue({});
    findByIdAndUpdate.mockReset().mockResolvedValue({ watchlist: ["550"] });
    logUserActivity.mockReset();
  });

  it("adds a movie for a plan with the watchlist", async () => {
    await expect(setWatchlist(USER_ID, "550", true)).resolves.toEqual(["550"]);

    expect(requireFeature).toHaveBeenCalledWith(USER_ID, "watchlist");
    expect(findByIdAndUpdate.mock.calls[0][1]).toEqual({ $addToSet: { watchlist: "550" } });
    expect(logUserActivity).toHaveBeenCalledWith(USER_ID, "watchlist_add", "550");
  });

  it("adding needs the watchlist feature", async () => {
    requireFeature.mockImplementation(async () => {
      throw forbidden;
    });

    await expect(setWatchlist(USER_ID, "550", true)).rejects.toMatchObject({ status: 403 });
    expect(findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("removing is always allowed", async () => {
    findByIdAndUpdate.mockResolvedValue({ watchlist: [] });

    await expect(setWatchlist(USER_ID, "550", false)).resolves.toEqual([]);

    expect(requireFeature).not.toHaveBeenCalled();
    expect(findByIdAndUpdate.mock.calls[0][1]).toEqual({ $pull: { watchlist: "550" } });
    expect(logUserActivity).toHaveBeenCalledWith(USER_ID, "watchlist_remove", "550");
  });

  it("answers 404 when the user is gone", async () => {
    findByIdAndUpdate.mockResolvedValue(null);

    await expect(setWatchlist(USER_ID, "550", false)).rejects.toMatchObject({ status: 404 });
  });
});
