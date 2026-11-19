import { describe, expect, it } from "vitest";
import { getBillingSummary } from "@/features/subscription/lib/billing";
import { SUBSCRIPTION_PLANS } from "@/entities/subscription/constants";

const premium = SUBSCRIPTION_PLANS.find((plan) => plan.id === "premium")!;
const PERIOD_END = "2027-11-17T12:00:00.000Z";
const CANCEL_AT = "2026-12-17T12:00:00.000Z";

const details = (overrides = {}) => ({
  interval: "month" as const,
  currentPeriodEnd: PERIOD_END,
  cancelAt: null,
  trialEnd: null,
  ...overrides,
});

describe("getBillingSummary", () => {
  it("shows the monthly price and the renewal date", () => {
    expect(getBillingSummary(premium, "active", details())).toEqual({
      interval: "Monthly",
      price: "$9.99 per month",
      date: "Renews on November 17, 2027",
    });
  });

  it("shows the yearly price for a yearly plan", () => {
    const summary = getBillingSummary(premium, "active", details({ interval: "year" }));
    expect(summary.interval).toBe("Yearly");
    expect(summary.price).toBe("$99.90 per year");
  });

  it("shows when a canceled plan ends instead of a renewal", () => {
    expect(getBillingSummary(premium, "active", details({ cancelAt: CANCEL_AT })).date).toBe(
      "Ends on December 17, 2026",
    );
  });

  it("shows when a trial ends", () => {
    expect(getBillingSummary(premium, "trialing", details({ trialEnd: CANCEL_AT })).date).toBe(
      "Trial ends on December 17, 2026",
    );
  });

  it("a canceled trial ends with the trial", () => {
    expect(
      getBillingSummary(premium, "trialing", details({ trialEnd: CANCEL_AT, cancelAt: CANCEL_AT }))
        .date,
    ).toBe("Ends on December 17, 2026");
  });
});
