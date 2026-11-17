import type { BILLING_INTERVALS, PAID_PLANS } from "@/features/subscription/constants";

export type PaidPlan = (typeof PAID_PLANS)[number];
export type SubscriptionPlan = "basic" | PaidPlan;

export type BillingInterval = (typeof BILLING_INTERVALS)[number];

/** What we store on the user about their Stripe subscription (see toSubscriptionFields). */
export interface SubscriptionFields {
  subscriptionStatus: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionId: string;
  subscriptionPriceId?: string;
  subscriptionInterval?: BillingInterval;
  currentPeriodEnd?: Date;
  /** When access ends after a cancellation; null while the subscription renews. */
  cancelAt: Date | null;
  trialEnd: Date | null;
  /** Only ever set to true: one free trial per account. */
  hasUsedTrial?: true;
}

/** Something a paid plan unlocks; see PLAN_FEATURES. */
export type Feature = "watchlist" | "customLists" | "advancedFilters" | "recommendations" | "stats";

export interface PlanFeature {
  label: string;
  comingSoon?: boolean;
}

export interface PlanDetails {
  id: SubscriptionPlan;
  name: string;
  /** Monthly price in USD. */
  price: number;
  /** Price for a year paid at once, in USD. */
  yearlyPrice: number;
  popular?: boolean;
  features: PlanFeature[];
}
