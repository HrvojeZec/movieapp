import type { AuthUser } from "@/features/auth/types";
import type { PlanDetails } from "@/features/subscription/types";
import { formatDate, formatPrice } from "@/shared/lib/format";

type SubscriptionDetails = NonNullable<AuthUser["subscription"]>;

export interface BillingSummary {
  /** "Monthly" or "Yearly" */
  interval: string;
  /** e.g. "$99.90 per year" */
  price: string;
  /** What happens next: the renewal, the end of a canceled plan, or the end of a trial. */
  date: string;
}

/** The billing lines of the profile's subscription panel, in plain words. */
export function getBillingSummary(
  plan: PlanDetails,
  status: string | undefined,
  subscription: SubscriptionDetails,
): BillingSummary {
  const yearly = subscription.interval === "year";

  const date = subscription.cancelAt
    ? `Ends on ${formatDate(subscription.cancelAt)}`
    : status === "trialing" && subscription.trialEnd
      ? `Trial ends on ${formatDate(subscription.trialEnd)}`
      : `Renews on ${formatDate(subscription.currentPeriodEnd)}`;

  return {
    interval: yearly ? "Yearly" : "Monthly",
    price: yearly
      ? `${formatPrice(plan.yearlyPrice)} per year`
      : `${formatPrice(plan.price)} per month`,
    date,
  };
}
