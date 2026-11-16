export const PAID_PLANS = ["premium", "pro"] as const;

export type PaidPlan = (typeof PAID_PLANS)[number];
export type SubscriptionPlan = "basic" | PaidPlan;

// Statuses in which the customer keeps access to their paid plan. `past_due` is included so a
// failed renewal doesn't downgrade immediately while Stripe retries the payment.
const ENTITLED_STATUSES = new Set(["active", "trialing", "past_due"]);

export function isPaidPlan(value: unknown): value is PaidPlan {
  return typeof value === "string" && (PAID_PLANS as readonly string[]).includes(value);
}

export function getPriceIdForPlan(plan: PaidPlan): string | undefined {
  const priceIds: Record<PaidPlan, string | undefined> = {
    premium: process.env.STRIPE_PREMIUM_PRICE_ID,
    pro: process.env.STRIPE_PRO_PRICE_ID,
  };
  return priceIds[plan];
}

export function getPlanForPriceId(priceId: string | null | undefined): SubscriptionPlan {
  if (!priceId) return "basic";
  if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) return "premium";
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro";
  return "basic";
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
