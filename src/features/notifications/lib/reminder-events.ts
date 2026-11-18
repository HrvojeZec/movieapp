import type { NotificationInput } from "@/features/notifications/types";
import {
  FEATURE_LABELS,
  PLAN_FEATURES,
  SUBSCRIPTION_PLANS,
} from "@/features/subscription/constants";
import { getPlanName } from "@/features/subscription/lib/entitlements";
import type { DueReminder } from "@/features/subscription/lib/reminders";
import { formatDate, formatPrice } from "@/shared/lib/format";
import { ROUTES } from "@/shared/routes";

/** The trial warning, shared by the daily reminders and Stripe's trial_will_end webhook. */
export function trialEndingNotification(
  planName: string,
  trialEnd: Date,
  dedupeKey: string,
): NotificationInput {
  return {
    type: "trial_ending",
    title: "Your free trial ends soon",
    body: `Your ${planName} trial ends on ${formatDate(trialEnd)}, and the subscription starts then. Cancel before that date if you don't want to be charged.`,
    link: ROUTES.profile,
    dedupeKey,
  };
}

const priceFor = (reminder: DueReminder) => {
  const plan = SUBSCRIPTION_PLANS.find((details) => details.id === reminder.plan);
  if (!plan) return null;
  return reminder.interval === "year"
    ? `${formatPrice(plan.yearlyPrice)} for the year`
    : `${formatPrice(plan.price)} for the month`;
};

/** The notification (and email) for a reminder from the daily job. */
export function getReminderNotification(reminder: DueReminder): NotificationInput {
  const planName = getPlanName(reminder.plan);
  const date = formatDate(reminder.date);

  switch (reminder.type) {
    case "trial_ending":
      return trialEndingNotification(planName, reminder.date, reminder.dedupeKey);

    case "ending_reminder": {
      const losing = PLAN_FEATURES[reminder.plan].map((feature) => FEATURE_LABELS[feature]);
      return {
        type: "ending_reminder",
        title: `${planName} ends on ${date}`,
        body: `Your canceled subscription ends on ${date}. After that you lose: ${losing.join(", ")}. You can resume it any time before then and keep everything as it is.`,
        link: ROUTES.profile,
        dedupeKey: reminder.dedupeKey,
      };
    }

    case "renewal_reminder": {
      const price = priceFor(reminder);
      return {
        type: "renewal_reminder",
        title: `${planName} renews on ${date}`,
        body: `Your subscription renews automatically on ${date}${price ? ` and costs ${price}` : ""}. Nothing to do if you'd like to keep it; you can cancel or change it in your profile.`,
        link: ROUTES.profile,
        dedupeKey: reminder.dedupeKey,
      };
    }
  }
}
