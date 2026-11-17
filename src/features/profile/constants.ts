import type { SubscriptionPlan } from "@/features/subscription/types";

export const PLAN_BADGE_COLORS: Record<SubscriptionPlan, string> = {
  basic: "gray",
  premium: "blue",
  pro: "orange",
};

// Rewritten in the UX polish task, together with the rest of the profile copy
export const PLAN_SUMMARIES: Record<SubscriptionPlan, string> = {
  basic: "📱 Basic features: Browse movies, add favorites, basic search",
  premium:
    "🎬 Premium features: Advanced filters, HD trailers, unlimited watchlist, priority support",
  pro: "🚀 Pro features: Everything in Premium + movie recommendations, analytics, API access",
};
