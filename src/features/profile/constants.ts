import { FAVORITES_LIMIT } from "@/features/subscription/constants";
import type { SubscriptionPlan } from "@/features/subscription/types";

export const PLAN_BADGE_COLORS: Record<SubscriptionPlan, string> = {
  basic: "gray",
  premium: "blue",
  pro: "orange",
};

// What each plan includes today; features that are still to come say so
export const PLAN_SUMMARIES: Record<SubscriptionPlan, string> = {
  basic: `Browse and search movies, watch trailers and save up to ${FAVORITES_LIMIT} favorites.`,
  premium:
    "Everything in Basic, with unlimited favorites. Watchlist and custom lists are coming soon.",
  pro: "Everything in Premium. Recommendations and viewing statistics are coming soon.",
};

interface StatusDisplay {
  label: string;
  color: string;
}

// Stripe subscription statuses in plain words; anything unknown falls back to the raw status
export const SUBSCRIPTION_STATUS_DISPLAY: Record<string, StatusDisplay> = {
  active: { label: "Active", color: "green" },
  trialing: { label: "Free trial", color: "green" },
  past_due: { label: "Payment due", color: "yellow" },
  unpaid: { label: "Unpaid", color: "red" },
  incomplete: { label: "Payment incomplete", color: "yellow" },
  incomplete_expired: { label: "Payment expired", color: "red" },
  paused: { label: "Paused", color: "gray" },
  canceled: { label: "Canceled", color: "gray" },
};
