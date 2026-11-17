import type { PAID_PLANS } from "@/features/subscription/constants";

export type PaidPlan = (typeof PAID_PLANS)[number];
export type SubscriptionPlan = "basic" | PaidPlan;

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
