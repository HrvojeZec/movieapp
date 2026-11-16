import type { SubscriptionPlan } from "./plans";

export interface PlanFeature {
  label: string;
  comingSoon?: boolean;
}

export interface PlanDetails {
  id: SubscriptionPlan;
  name: string;
  price: number;
  popular?: boolean;
  features: PlanFeature[];
}

// Display data only: Stripe price IDs are resolved on the server (src/features/subscription/plans.ts).
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
