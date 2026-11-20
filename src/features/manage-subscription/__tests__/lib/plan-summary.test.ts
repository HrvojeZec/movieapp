import { describe, expect, it } from "vitest";
import { FEATURE_LABELS, PLAN_FEATURES } from "@/entities/subscription/constants";
import { describePlan } from "@/features/manage-subscription/lib/plan-summary";

describe("describePlan", () => {
  it("describes what each paid plan adds, from the same list the server checks", () => {
    expect(describePlan("premium")).toBe(
      "Everything in Basic, plus unlimited favorites, watchlist, custom lists and advanced filters.",
    );
    expect(describePlan("pro")).toBe(
      "Everything in Premium, plus recommendations and viewing statistics.",
    );
  });

  it("describes the free plan with its favorites limit", () => {
    expect(describePlan("basic")).toBe(
      "Browse, search and filter movies, watch trailers, track what you've watched and save up to 20 favorites.",
    );
  });

  it("names every feature a plan unlocks and promises nothing that is still to come", () => {
    for (const plan of ["premium", "pro"] as const) {
      const summary = describePlan(plan).toLowerCase();
      const added =
        plan === "pro"
          ? PLAN_FEATURES.pro.filter((feature) => !PLAN_FEATURES.premium.includes(feature))
          : PLAN_FEATURES.premium;
      for (const feature of added) {
        expect(summary).toContain(FEATURE_LABELS[feature].toLowerCase());
      }
      expect(summary).not.toContain("coming soon");
    }
  });
});
