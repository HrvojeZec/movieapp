import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_LAYOUT } from "@/entities/stats/constants";
import type { LayoutItem } from "@/entities/stats/types";

// A Mongoose query stand-in: every builder method chains, lean() resolves the result
const query = (result: unknown) => {
  const chain: Record<string, unknown> = new Proxy(
    {},
    { get: (_, prop) => (prop === "lean" ? () => Promise.resolve(result) : () => chain) },
  );
  return chain;
};

const db = { user: null as { dashboardLayout: LayoutItem[] } | null, matched: 1 };
const updateOne = vi.fn();

vi.mock("@/server/db/mongodb", () => ({ default: vi.fn() }));
vi.mock("@/server/models/User", () => ({
  default: {
    findById: () => query(db.user),
    updateOne: async (...args: unknown[]) => {
      updateOne(...args);
      return { matchedCount: db.matched };
    },
  },
}));

const { getDashboardLayout, saveDashboardLayout } =
  await import("@/entities/stats/server/dashboard");

const USER_ID = "507f1f77bcf86cd799439011";

describe("getDashboardLayout", () => {
  beforeEach(() => {
    db.user = { dashboardLayout: [] };
  });

  it("returns the default layout when nothing is saved", async () => {
    expect(await getDashboardLayout(USER_ID)).toEqual(DEFAULT_LAYOUT);
  });

  it("GET returns a repaired layout", async () => {
    db.user = {
      dashboardLayout: [
        { type: "genreBars", x: 0, y: 3, w: 6, h: 5 },
        { type: "genreBars", x: 6, y: 0, w: 6, h: 5 },
        { type: "retiredWidget" as LayoutItem["type"], x: 0, y: 0, w: 3, h: 2 },
      ],
    };
    expect(await getDashboardLayout(USER_ID)).toEqual([
      { type: "genreBars", x: 0, y: 0, w: 6, h: 5 },
    ]);
  });

  it("answers 404 for a user that no longer exists", async () => {
    db.user = null;
    await expect(getDashboardLayout(USER_ID)).rejects.toMatchObject({ status: 404 });
  });
});

describe("saveDashboardLayout", () => {
  beforeEach(() => {
    db.matched = 1;
    updateOne.mockReset();
  });

  it("saving sanitizes and stores the layout", async () => {
    const saved = await saveDashboardLayout(USER_ID, [
      { type: "tileWatched", x: 0, y: 4, w: 3, h: 2 },
      { type: "viewsTrend", x: 10, y: 0, w: 6, h: 9 },
    ]);

    const expected = [
      { type: "viewsTrend", x: 6, y: 0, w: 6, h: 6 },
      { type: "tileWatched", x: 0, y: 0, w: 3, h: 2 },
    ].sort((a, b) => a.y - b.y || a.x - b.x);
    expect(saved).toEqual(expected);
    expect(updateOne).toHaveBeenCalledWith(
      { _id: USER_ID },
      { $set: { dashboardLayout: expected } },
    );
  });

  it("saving keeps the view", async () => {
    const saved = await saveDashboardLayout(USER_ID, [
      { type: "genreBars", x: 0, y: 0, w: 6, h: 5, view: "table" },
    ]);
    expect(saved).toEqual([{ type: "genreBars", x: 0, y: 0, w: 6, h: 5, view: "table" }]);
    expect(updateOne.mock.calls[0][1]).toEqual({ $set: { dashboardLayout: saved } });
  });

  it("answers 404 for a user that no longer exists", async () => {
    db.matched = 0;
    await expect(saveDashboardLayout(USER_ID, [])).rejects.toMatchObject({ status: 404 });
  });
});
