import { describe, expect, it } from "vitest";
import { FAVORITES_LIMIT } from "@/entities/subscription/constants";
import {
  getEffectivePlan,
  getFavoritesLimit,
  hasFeature,
  requiredPlanFor,
} from "@/entities/subscription/lib/entitlements";
import type { Feature } from "@/entities/subscription/types";

const ALL_FEATURES: Feature[] = [
  "watchlist",
  "customLists",
  "advancedFilters",
  "recommendations",
  "stats",
];

describe("hasFeature", () => {
  it("basic has no paid features", () => {
    for (const feature of ALL_FEATURES) expect(hasFeature("basic", feature)).toBe(false);
  });

  it("premium unlocks watchlist, lists and advanced filters but not recommendations", () => {
    expect(hasFeature("premium", "watchlist")).toBe(true);
    expect(hasFeature("premium", "customLists")).toBe(true);
    expect(hasFeature("premium", "advancedFilters")).toBe(true);
    expect(hasFeature("premium", "recommendations")).toBe(false);
    expect(hasFeature("premium", "stats")).toBe(false);
  });

  it("pro unlocks every feature", () => {
    for (const feature of ALL_FEATURES) expect(hasFeature("pro", feature)).toBe(true);
  });
});

describe("getEffectivePlan", () => {
  it("uses the paid plan while the subscription is active or trialing", () => {
    expect(getEffectivePlan({ subscriptionStatus: "active", subscriptionPlan: "premium" })).toBe(
      "premium",
    );
    expect(getEffectivePlan({ subscriptionStatus: "trialing", subscriptionPlan: "pro" })).toBe(
      "pro",
    );
  });

  it("a canceled or unpaid subscription falls back to basic", () => {
    expect(getEffectivePlan({ subscriptionStatus: "canceled", subscriptionPlan: "pro" })).toBe(
      "basic",
    );
    expect(getEffectivePlan({ subscriptionStatus: "unpaid", subscriptionPlan: "premium" })).toBe(
      "basic",
    );
    expect(
      getEffectivePlan({ subscriptionStatus: "incomplete_expired", subscriptionPlan: "pro" }),
    ).toBe("basic");
  });

  it("past_due keeps the paid plan", () => {
    expect(getEffectivePlan({ subscriptionStatus: "past_due", subscriptionPlan: "premium" })).toBe(
      "premium",
    );
  });

  it("treats a missing or unknown plan as basic", () => {
    expect(getEffectivePlan({})).toBe("basic");
    expect(getEffectivePlan({ subscriptionStatus: "active" })).toBe("basic");
    expect(getEffectivePlan({ subscriptionStatus: "active", subscriptionPlan: "gold" })).toBe(
      "basic",
    );
  });
});

describe("getFavoritesLimit", () => {
  it("only basic has a favorites limit of 20", () => {
    expect(FAVORITES_LIMIT).toBe(20);
    expect(getFavoritesLimit("basic")).toBe(20);
    expect(getFavoritesLimit("premium")).toBeNull();
    expect(getFavoritesLimit("pro")).toBeNull();
  });
});

describe("requiredPlanFor", () => {
  it("recommendations and stats require pro", () => {
    expect(requiredPlanFor("recommendations")).toBe("pro");
    expect(requiredPlanFor("stats")).toBe("pro");
  });

  it("the other features require premium", () => {
    expect(requiredPlanFor("watchlist")).toBe("premium");
    expect(requiredPlanFor("customLists")).toBe("premium");
    expect(requiredPlanFor("advancedFilters")).toBe("premium");
  });
});
