import {
  FAVORITES_LIMIT,
  FEATURE_LABELS,
  PAID_PLANS,
  PLAN_FEATURES,
  SUBSCRIPTION_PLANS,
} from "@/features/subscription/constants";
import { hasActiveSubscription, isPaidPlan } from "@/features/subscription/lib/plans";
import type { Feature, PaidPlan, SubscriptionPlan } from "@/features/subscription/types";

interface SubscriptionFields {
  subscriptionStatus?: string | null;
  subscriptionPlan?: string | null;
}

/**
 * The plan a user actually has right now: the paid plan only while Stripe still entitles them
 * to it (active, trialing or past_due), otherwise basic.
 */
export function getEffectivePlan(user: SubscriptionFields): SubscriptionPlan {
  return hasActiveSubscription(user.subscriptionStatus) && isPaidPlan(user.subscriptionPlan)
    ? user.subscriptionPlan
    : "basic";
}

export function hasFeature(plan: SubscriptionPlan, feature: Feature): boolean {
  return PLAN_FEATURES[plan].includes(feature);
}

/** null means no limit. */
export function getFavoritesLimit(plan: SubscriptionPlan): number | null {
  return plan === "basic" ? FAVORITES_LIMIT : null;
}

/** The cheapest plan that includes the feature, for "Upgrade to …" prompts. */
export function requiredPlanFor(feature: Feature): PaidPlan {
  // PAID_PLANS is ordered from cheapest to most expensive, and the most expensive has everything
  return PAID_PLANS.find((plan) => hasFeature(plan, feature)) ?? "pro";
}

export const getPlanName = (plan: SubscriptionPlan): string =>
  SUBSCRIPTION_PLANS.find((details) => details.id === plan)?.name ?? plan;

/** e.g. "Watchlist requires the Premium plan" */
export const featureRequirementMessage = (feature: Feature): string =>
  `${FEATURE_LABELS[feature]} requires the ${getPlanName(requiredPlanFor(feature))} plan`;
