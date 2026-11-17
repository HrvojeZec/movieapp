import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getPlanForPriceId,
  getPriceIdForPlan,
  hasActiveSubscription,
  isPaidPlan,
} from "@/features/subscription/lib/plans";

const PREMIUM_PRICE = "price_premium_test";
const PRO_PRICE = "price_pro_test";
const PREMIUM_YEARLY_PRICE = "price_premium_yearly_test";
const PRO_YEARLY_PRICE = "price_pro_yearly_test";

beforeEach(() => {
  vi.stubEnv("STRIPE_PREMIUM_PRICE_ID", PREMIUM_PRICE);
  vi.stubEnv("STRIPE_PRO_PRICE_ID", PRO_PRICE);
  vi.stubEnv("STRIPE_PREMIUM_YEARLY_PRICE_ID", PREMIUM_YEARLY_PRICE);
  vi.stubEnv("STRIPE_PRO_YEARLY_PRICE_ID", PRO_YEARLY_PRICE);
});

describe("isPaidPlan", () => {
  it.each(["premium", "pro"])("accepts %s", (plan) => {
    expect(isPaidPlan(plan)).toBe(true);
  });

  it.each(["basic", "enterprise", "", undefined, null, 1])("rejects %s", (value) => {
    expect(isPaidPlan(value)).toBe(false);
  });
});

describe("getPriceIdForPlan", () => {
  it("maps each plan and interval to its price", () => {
    expect(getPriceIdForPlan("premium", "month")).toBe(PREMIUM_PRICE);
    expect(getPriceIdForPlan("pro", "month")).toBe(PRO_PRICE);
    expect(getPriceIdForPlan("premium", "year")).toBe(PREMIUM_YEARLY_PRICE);
    expect(getPriceIdForPlan("pro", "year")).toBe(PRO_YEARLY_PRICE);
  });

  it("returns undefined when the price ID is not configured", () => {
    vi.stubEnv("STRIPE_PRO_YEARLY_PRICE_ID", undefined);
    expect(getPriceIdForPlan("pro", "year")).toBeUndefined();
  });
});

describe("getPlanForPriceId", () => {
  it("maps a monthly price back to its plan and interval", () => {
    expect(getPlanForPriceId(PREMIUM_PRICE)).toEqual({ plan: "premium", interval: "month" });
    // Regression: the Pro price used to be compared with the webhook secret and never matched
    expect(getPlanForPriceId(PRO_PRICE)).toEqual({ plan: "pro", interval: "month" });
  });

  it("maps a yearly price back to its plan and interval", () => {
    expect(getPlanForPriceId(PREMIUM_YEARLY_PRICE)).toEqual({ plan: "premium", interval: "year" });
    expect(getPlanForPriceId(PRO_YEARLY_PRICE)).toEqual({ plan: "pro", interval: "year" });
  });

  it.each([undefined, null, "", "price_unknown"])("an unknown price maps to null (%s)", (id) => {
    expect(getPlanForPriceId(id)).toBeNull();
  });

  it("an unset yearly price doesn't match an empty price ID", () => {
    vi.stubEnv("STRIPE_PRO_YEARLY_PRICE_ID", undefined);
    expect(getPlanForPriceId(undefined)).toBeNull();
  });
});

describe("hasActiveSubscription", () => {
  it.each(["active", "trialing", "past_due"])("grants access while %s", (status) => {
    expect(hasActiveSubscription(status)).toBe(true);
  });

  it.each(["canceled", "unpaid", "incomplete", "incomplete_expired", "paused", "free", null])(
    "denies access when %s",
    (status) => {
      expect(hasActiveSubscription(status)).toBe(false);
    },
  );
});
