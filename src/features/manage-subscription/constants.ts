import type { SubscriptionPlan } from "@/entities/subscription/types";

export const PLAN_BADGE_COLORS: Record<SubscriptionPlan, string> = {
  basic: "gray",
  premium: "blue",
  pro: "orange",
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
