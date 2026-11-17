import type { Feature, PlanDetails, SubscriptionPlan } from "@/features/subscription/types";

export const PAID_PLANS = ["premium", "pro"] as const;

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
      { label: "Save favorites" },
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
      { label: "Watchlist", comingSoon: true },
      { label: "Custom movie lists", comingSoon: true },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 19.99,
    yearlyPrice: 199.9,
    features: [
      { label: "Everything in Premium" },
      { label: "Personalized recommendations", comingSoon: true },
      { label: "Viewing statistics", comingSoon: true },
    ],
  },
];
