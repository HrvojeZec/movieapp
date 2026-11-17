import { ENTITLED_STATUSES, PAID_PLANS } from "@/features/subscription/constants";
import type { PaidPlan, SubscriptionPlan } from "@/features/subscription/types";

export function isPaidPlan(value: unknown): value is PaidPlan {
  return typeof value === "string" && (PAID_PLANS as readonly string[]).includes(value);
}

// Optional: without them checkout answers 503 instead of failing, so they are read per call
const getPriceIds = (): Record<PaidPlan, string | undefined> => ({
  premium: process.env.STRIPE_PREMIUM_PRICE_ID,
  pro: process.env.STRIPE_PRO_PRICE_ID,
});

export function getPriceIdForPlan(plan: PaidPlan): string | undefined {
  return getPriceIds()[plan];
}

export function getPlanForPriceId(priceId: string | null | undefined): SubscriptionPlan {
  if (!priceId) return "basic";
  const priceIds = getPriceIds();
  return PAID_PLANS.find((plan) => priceIds[plan] === priceId) ?? "basic";
}

export function hasActiveSubscription(status: string | null | undefined): boolean {
  return !!status && ENTITLED_STATUSES.has(status);
}

export function getPlanForSubscription(
  status: string,
  priceId: string | null | undefined,
): SubscriptionPlan {
  return hasActiveSubscription(status) ? getPlanForPriceId(priceId) : "basic";
}
