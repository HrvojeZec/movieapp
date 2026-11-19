import type Stripe from "stripe";
import { hasActiveSubscription } from "@/features/subscription/lib/plans";
import type {
  BillingInterval,
  SubscriptionFields,
  SubscriptionPlan,
} from "@/features/subscription/types";
import { SECOND_MS } from "@/shared/lib/time";

/** Which plan and billing interval a Stripe price ID stands for; null for an unknown price. */
export type PriceResolver = (
  priceId?: string,
) => { plan: SubscriptionPlan; interval: BillingInterval } | null;

const toDate = (unixSeconds: number | null | undefined): Date | null =>
  unixSeconds ? new Date(unixSeconds * SECOND_MS) : null;

const isBillingInterval = (value: unknown): value is BillingInterval =>
  value === "month" || value === "year";

/**
 * The subscription that should decide the user's plan, out of all of the customer's: one that
 * grants access beats one that ended, and the newest wins between equals. Webhooks can arrive late
 * (Stripe retries for days), so an old subscription's event must not replace a newer one.
 */
export function pickCurrentSubscription(
  subscriptions: Stripe.Subscription[],
): Stripe.Subscription | null {
  const rank = (subscription: Stripe.Subscription) =>
    hasActiveSubscription(subscription.status) ? 1 : 0;
  return subscriptions.reduce<Stripe.Subscription | null>(
    (best, candidate) =>
      !best ||
      rank(candidate) > rank(best) ||
      (rank(candidate) === rank(best) && candidate.created > best.created)
        ? candidate
        : best,
    null,
  );
}

/**
 * The user fields for a Stripe subscription. The paid plan only counts while Stripe entitles the
 * customer to it; a cancellation shows up either as `cancel_at_period_end` (our own cancel) or as
 * `cancel_at` (the Customer Portal schedules one), and both mean access ends on that date.
 */
export function toSubscriptionFields(
  subscription: Stripe.Subscription,
  resolvePrice: PriceResolver,
): SubscriptionFields {
  const item = subscription.items.data[0];
  const priceId = item?.price.id;
  const resolved = resolvePrice(priceId);
  const currentPeriodEnd = toDate(item?.current_period_end) ?? undefined;
  const recurring = item?.price.recurring?.interval;

  return {
    subscriptionStatus: subscription.status,
    subscriptionPlan:
      resolved && hasActiveSubscription(subscription.status) ? resolved.plan : "basic",
    subscriptionId: subscription.id,
    subscriptionPriceId: priceId,
    subscriptionInterval: isBillingInterval(recurring) ? recurring : resolved?.interval,
    currentPeriodEnd,
    cancelAt:
      toDate(subscription.cancel_at) ??
      (subscription.cancel_at_period_end ? (currentPeriodEnd ?? null) : null),
    trialEnd: toDate(subscription.trial_end),
    ...(subscription.trial_start ? { hasUsedTrial: true as const } : {}),
  };
}
