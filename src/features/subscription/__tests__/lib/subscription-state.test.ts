import type Stripe from "stripe";
import { describe, expect, it } from "vitest";
import { toSubscriptionFields } from "@/features/subscription/lib/subscription-state";

// Stripe times are Unix seconds
const PERIOD_END = 1_800_000_000;
const CANCEL_AT = 1_790_000_000;
const TRIAL_START = 1_770_000_000;
const TRIAL_END = 1_771_209_600;

// Only the fields the mapper reads; real subscriptions carry many more
const subscription = (
  overrides: Partial<Stripe.Subscription> = {},
  interval: string | null = "month",
): Stripe.Subscription =>
  ({
    id: "sub_123",
    status: "active",
    cancel_at: null,
    cancel_at_period_end: false,
    trial_start: null,
    trial_end: null,
    items: {
      data: [
        {
          current_period_end: PERIOD_END,
          price: { id: "price_premium", recurring: interval ? { interval } : null },
        },
      ],
    },
    ...overrides,
  }) as unknown as Stripe.Subscription;

const resolvePremium = () => ({ plan: "premium" as const, interval: "month" as const });

describe("toSubscriptionFields", () => {
  it("reads the period end from the subscription item", () => {
    const fields = toSubscriptionFields(subscription(), resolvePremium);

    expect(fields.currentPeriodEnd).toEqual(new Date(PERIOD_END * 1000));
    expect(fields.subscriptionId).toBe("sub_123");
    expect(fields.subscriptionPriceId).toBe("price_premium");
    expect(fields.subscriptionStatus).toBe("active");
    expect(fields.subscriptionPlan).toBe("premium");
  });

  it("treats cancel_at_period_end as ending at the period end", () => {
    const fields = toSubscriptionFields(
      subscription({ cancel_at_period_end: true }),
      resolvePremium,
    );
    expect(fields.cancelAt).toEqual(new Date(PERIOD_END * 1000));
  });

  it("uses cancel_at when the portal schedules a cancellation", () => {
    const fields = toSubscriptionFields(subscription({ cancel_at: CANCEL_AT }), resolvePremium);
    expect(fields.cancelAt).toEqual(new Date(CANCEL_AT * 1000));
  });

  it("has no end date for a renewing subscription", () => {
    expect(toSubscriptionFields(subscription(), resolvePremium).cancelAt).toBeNull();
  });

  it("records that a trial was used", () => {
    const fields = toSubscriptionFields(
      subscription({ status: "trialing", trial_start: TRIAL_START, trial_end: TRIAL_END }),
      resolvePremium,
    );
    expect(fields.hasUsedTrial).toBe(true);
    expect(fields.trialEnd).toEqual(new Date(TRIAL_END * 1000));
  });

  it("never clears a trial recorded earlier", () => {
    // Leaving the field out keeps the stored value; a later trial-less renewal must not reset it
    expect(toSubscriptionFields(subscription(), resolvePremium)).not.toHaveProperty("hasUsedTrial");
  });

  it("reads the billing interval from the price", () => {
    expect(
      toSubscriptionFields(subscription({}, "year"), resolvePremium).subscriptionInterval,
    ).toBe("year");
  });

  it("falls back to the configured interval when the price has none", () => {
    const resolveYearly = () => ({ plan: "pro" as const, interval: "year" as const });
    expect(toSubscriptionFields(subscription({}, null), resolveYearly).subscriptionInterval).toBe(
      "year",
    );
  });

  it("a canceled subscription maps to the basic plan", () => {
    const fields = toSubscriptionFields(subscription({ status: "canceled" }), resolvePremium);
    expect(fields.subscriptionPlan).toBe("basic");
    expect(fields.subscriptionStatus).toBe("canceled");
  });

  it("an unknown price maps to the basic plan", () => {
    expect(toSubscriptionFields(subscription(), () => null).subscriptionPlan).toBe("basic");
  });
});
