import {
  BILLING_INTERVALS,
  ENTITLED_STATUSES,
  PAID_PLANS,
} from "@/entities/subscription/constants";
import type { BillingInterval, PaidPlan } from "@/entities/subscription/types";

export function isPaidPlan(value: unknown): value is PaidPlan {
  return typeof value === "string" && (PAID_PLANS as readonly string[]).includes(value);
}

// Optional: without them checkout answers 503 instead of failing, so they are read per call
const getPriceIds = (): Record<PaidPlan, Record<BillingInterval, string | undefined>> => ({
  premium: {
    month: process.env.STRIPE_PREMIUM_PRICE_ID,
    year: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID,
  },
  pro: {
    month: process.env.STRIPE_PRO_PRICE_ID,
    year: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
  },
});

export function getPriceIdForPlan(plan: PaidPlan, interval: BillingInterval): string | undefined {
  return getPriceIds()[plan][interval];
}

/** Which plan and billing interval a Stripe price stands for; null for a price we don't sell. */
export function getPlanForPriceId(
  priceId: string | null | undefined,
): { plan: PaidPlan; interval: BillingInterval } | null {
  if (!priceId) return null;
  const priceIds = getPriceIds();
  for (const plan of PAID_PLANS) {
    for (const interval of BILLING_INTERVALS) {
      if (priceIds[plan][interval] === priceId) return { plan, interval };
    }
  }
  return null;
}

export function hasActiveSubscription(status: string | null | undefined): boolean {
  return !!status && ENTITLED_STATUSES.has(status);
}
