import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getPlanForPriceId,
  getPriceIdForPlan,
  hasActiveSubscription,
  isPaidPlan,
} from "@/features/subscription/lib/plans";

const PREMIUM_PRICE = "price_premium_test";
const PRO_PRICE = "price_pro_test";

beforeEach(() => {
  vi.stubEnv("STRIPE_PREMIUM_PRICE_ID", PREMIUM_PRICE);
  vi.stubEnv("STRIPE_PRO_PRICE_ID", PRO_PRICE);
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
  it("maps each paid plan to its own price ID", () => {
    expect(getPriceIdForPlan("premium")).toBe(PREMIUM_PRICE);
    expect(getPriceIdForPlan("pro")).toBe(PRO_PRICE);
  });

  it("returns undefined when the price ID is not configured", () => {
    vi.stubEnv("STRIPE_PRO_PRICE_ID", undefined);
    expect(getPriceIdForPlan("pro")).toBeUndefined();
  });
});

describe("getPlanForPriceId", () => {
  it("maps known price IDs back to plans", () => {
    expect(getPlanForPriceId(PREMIUM_PRICE)).toBe("premium");
    // Regression: the Pro price used to be compared with the webhook secret and never matched
    expect(getPlanForPriceId(PRO_PRICE)).toBe("pro");
  });

  it.each([undefined, null, "", "price_unknown"])("falls back to basic for %s", (priceId) => {
    expect(getPlanForPriceId(priceId)).toBe("basic");
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
