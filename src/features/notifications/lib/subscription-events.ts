import type Stripe from "stripe";
import { trialEndingNotification } from "@/features/notifications/lib/reminder-events";
import type { NotificationInput } from "@/features/notifications/types";
import { getPlanName } from "@/features/subscription/lib/entitlements";
import { getPlanForPriceId } from "@/features/subscription/lib/plans";
import { reminderDedupeKey } from "@/features/subscription/lib/reminders";
import { formatDate } from "@/shared/lib/format";
import { ROUTES } from "@/shared/routes";
import { SECOND_MS } from "@/shared/lib/time";

const toDate = (unixSeconds: number | null | undefined) =>
  unixSeconds ? formatDate(new Date(unixSeconds * SECOND_MS)) : null;

const priceIdOf = (subscription: Stripe.Subscription) => subscription.items?.data[0]?.price.id;

/** "Premium", or "your plan" when the price isn't one we sell. */
const planNameOf = (subscription: Stripe.Subscription) => {
  const resolved = getPlanForPriceId(priceIdOf(subscription));
  return resolved ? getPlanName(resolved.plan) : "your plan";
};

const isScheduledToCancel = (fields: {
  cancel_at?: number | null;
  cancel_at_period_end?: boolean;
}) => !!fields.cancel_at || !!fields.cancel_at_period_end;

/**
 * The notification a Stripe event deserves, or null. It is read from the event itself (for
 * updates, `previous_attributes` says what changed), while the user's stored state is synced
 * separately. Each event notifies at most once (`stripe:<event id>`); activation uses the
 * subscription ID because both Checkout and the webhook can report it.
 */
export function getSubscriptionNotification(event: Stripe.Event): NotificationInput | null {
  const fromStripe = { dedupeKey: `stripe:${event.id}`, link: ROUTES.profile };

  switch (event.type) {
    case "customer.subscription.created": {
      const subscription = event.data.object;
      const plan = planNameOf(subscription);
      if (subscription.status === "trialing") {
        return {
          ...fromStripe,
          type: "trial_started",
          title: `Your ${plan} trial has started`,
          body: `Enjoy ${plan} for free until ${toDate(subscription.trial_end)}. Cancel any time before then and you won't be charged.`,
          dedupeKey: `trial_started:${subscription.id}`,
        };
      }
      return {
        ...fromStripe,
        type: "plan_activated",
        title: `${plan} is active`,
        body: `Your ${plan} subscription is active. Everything it includes is unlocked.`,
        dedupeKey: `plan_activated:${subscription.id}`,
      };
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const previous = event.data.previous_attributes ?? {};
      const plan = planNameOf(subscription);
      const cancellationChanged = "cancel_at" in previous || "cancel_at_period_end" in previous;

      if (cancellationChanged && isScheduledToCancel(subscription)) {
        const endsOn =
          toDate(subscription.cancel_at) ?? toDate(subscription.items?.data[0]?.current_period_end);
        return {
          ...fromStripe,
          type: "subscription_canceled",
          title: "Subscription canceled",
          body: `You keep ${plan} until ${endsOn}. You won't be charged again, and you can resume any time before then.`,
        };
      }
      if (cancellationChanged && isScheduledToCancel(previous)) {
        return {
          ...fromStripe,
          type: "subscription_resumed",
          title: "Subscription resumed",
          body: `Your ${plan} subscription renews as before.`,
        };
      }

      const previousPriceId = previous.items?.data?.[0]?.price?.id;
      if (previousPriceId && previousPriceId !== priceIdOf(subscription)) {
        return {
          ...fromStripe,
          type: "plan_changed",
          title: `You're now on ${plan}`,
          body: `Your subscription switched to ${plan}. Stripe adjusts the price for the rest of the billing period.`,
        };
      }
      return null;
    }

    case "customer.subscription.deleted":
      return {
        ...fromStripe,
        type: "subscription_ended",
        title: "Subscription ended",
        body: `Your ${planNameOf(event.data.object)} subscription has ended and your account is on the free Basic plan. Your favorites and lists are kept.`,
      };

    case "customer.subscription.trial_will_end": {
      const subscription = event.data.object;
      if (!subscription.trial_end) return null;
      const trialEnd = new Date(subscription.trial_end * SECOND_MS);
      // The daily reminder job uses the same key, so whichever comes first is the only one sent
      return trialEndingNotification(
        planNameOf(subscription),
        trialEnd,
        reminderDedupeKey("trial_ending", subscription.id, trialEnd),
      );
    }

    case "invoice.payment_failed":
      return {
        ...fromStripe,
        type: "payment_failed",
        title: "Payment failed",
        body: "We couldn't charge your card for your subscription. Stripe will try again over the next few days; update your payment method to keep your plan.",
      };

    default:
      return null;
  }
}
