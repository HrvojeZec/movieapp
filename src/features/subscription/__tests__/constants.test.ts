import { describe, expect, it } from "vitest";
import {
  FEATURE_LABELS,
  PLAN_FEATURES,
  SUBSCRIPTION_PLANS,
} from "@/features/subscription/constants";

const labelsOf = (planId: string) =>
  SUBSCRIPTION_PLANS.find((plan) => plan.id === planId)!.features.map((feature) => feature.label);

describe("SUBSCRIPTION_PLANS", () => {
  it.each(["premium", "pro"] as const)(
    "the %s card lists every feature the plan unlocks, itself or through the plan below",
    (planId) => {
      const listed = [...labelsOf("premium"), ...(planId === "pro" ? labelsOf("pro") : [])];
      for (const feature of PLAN_FEATURES[planId]) {
        expect(listed).toContain(FEATURE_LABELS[feature]);
      }
    },
  );

  it("Pro lists only what it adds on top of Premium", () => {
    expect(labelsOf("pro")).toEqual([
      "Everything in Premium",
      FEATURE_LABELS.recommendations,
      FEATURE_LABELS.stats,
    ]);
  });

  it("Basic mentions the watched history, which every plan has", () => {
    expect(labelsOf("basic")).toContain("Track the movies you've watched");
  });
});
