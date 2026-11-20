import type { Feature, PlanDetails, SubscriptionPlan } from "@/entities/subscription/types";

export const PAID_PLANS = ["premium", "pro"] as const;

export const BILLING_INTERVALS = ["month", "year"] as const;

// Statuses in which the customer keeps access to their paid plan. `past_due` is included so a
// failed renewal doesn't downgrade immediately while Stripe retries the payment.
export const ENTITLED_STATUSES = new Set(["active", "trialing", "past_due"]);

// What each plan unlocks: the one source of truth for the server checks and the locked UI.
// Pro includes everything in Premium.
const PREMIUM_FEATURES = [
  "watchlist",
  "customLists",
  "advancedFilters",
] as const satisfies Feature[];
export const PLAN_FEATURES: Record<SubscriptionPlan, readonly Feature[]> = {
  basic: [],
  premium: PREMIUM_FEATURES,
  pro: [...PREMIUM_FEATURES, "recommendations", "stats"],
};

// Reminders go out this many days before a renewal, a scheduled end or the end of a trial
export const REMINDER_DAYS_BEFORE = 3;

// How many favorites the free plan can keep; paid plans have no limit
export const FAVORITES_LIMIT = 20;

// Feature names as people read them, e.g. in "Watchlist requires the Premium plan"
export const FEATURE_LABELS: Record<Feature, string> = {
  watchlist: "Watchlist",
  customLists: "Custom lists",
  advancedFilters: "Advanced filters",
  recommendations: "Recommendations",
  stats: "Viewing statistics",
};

// The paid features on the cards come from PLAN_FEATURES, so the pricing page can't promise
// something the server doesn't unlock, or miss something it does
const toPlanFeatures = (features: readonly Feature[]) =>
  features.map((feature) => ({ label: FEATURE_LABELS[feature] }));

// Display data only: Stripe price IDs are resolved on the server (src/features/subscription/lib/plans.ts).
export const SUBSCRIPTION_PLANS: PlanDetails[] = [
  {
    id: "basic",
    name: "Basic",
    price: 0,
    yearlyPrice: 0,
    features: [
      { label: "Browse and search movies" },
      { label: "Filter by year, genre and rating" },
      { label: "Watch trailers" },
      { label: "Track the movies you've watched" },
      { label: `Save up to ${FAVORITES_LIMIT} favorites` },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 9.99,
    yearlyPrice: 99.9,
    popular: true,
    features: [
      { label: "Everything in Basic" },
      { label: "Unlimited favorites" },
      ...toPlanFeatures(PLAN_FEATURES.premium),
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 19.99,
    yearlyPrice: 199.9,
    features: [
      { label: "Everything in Premium" },
      ...toPlanFeatures(
        PLAN_FEATURES.pro.filter((feature) => !PLAN_FEATURES.premium.includes(feature)),
      ),
    ],
  },
];

// The first subscription starts with a free trial; Checkout still takes a card up front
export const TRIAL_DAYS = 14;
