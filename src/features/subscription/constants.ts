import type { PlanDetails } from "@/features/subscription/types";

export const PAID_PLANS = ["premium", "pro"] as const;

// Statuses in which the customer keeps access to their paid plan. `past_due` is included so a
// failed renewal doesn't downgrade immediately while Stripe retries the payment.
export const ENTITLED_STATUSES = new Set(["active", "trialing", "past_due"]);

// Display data only: Stripe price IDs are resolved on the server (src/features/subscription/lib/plans.ts).
export const SUBSCRIPTION_PLANS: PlanDetails[] = [
  {
    id: "basic",
    name: "Basic",
    price: 0,
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
    features: [
      { label: "Everything in Premium" },
      { label: "Personalized recommendations", comingSoon: true },
      { label: "Viewing statistics", comingSoon: true },
    ],
  },
];
