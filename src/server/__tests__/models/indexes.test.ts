import { describe, expect, it } from "vitest";
import { STATS_DAYS } from "@/entities/stats/constants";
import User from "@/server/models/User";
import UserActivity from "@/server/models/UserActivity";
import { DAY_IN_SECONDS } from "@/shared/lib/time";

type IndexEntry = [Record<string, unknown>, Record<string, unknown>];
const indexes = (model: { schema: { indexes: () => unknown[] } }) =>
  model.schema.indexes() as IndexEntry[];
const findIndex = (entries: IndexEntry[], fields: Record<string, unknown>) =>
  entries.find(([keys]) => JSON.stringify(keys) === JSON.stringify(fields));

describe("UserActivity indexes", () => {
  it("old activity expires, but only after the stats stop reading it", () => {
    const ttl = findIndex(indexes(UserActivity), { createdAt: 1 });

    expect(ttl?.[1].expireAfterSeconds).toBeGreaterThan(STATS_DAYS * DAY_IN_SECONDS);
  });

  it("a user's activity of one kind in a time range is read from one index", () => {
    expect(findIndex(indexes(UserActivity), { userId: 1, action: 1, createdAt: -1 })).toBeDefined();
  });
});

describe("User indexes", () => {
  it("a reset link finds its account without reading every user", () => {
    const index = findIndex(indexes(User), { passwordResetTokenHash: 1 });

    expect(index?.[1]).toMatchObject({ sparse: true });
  });
});
