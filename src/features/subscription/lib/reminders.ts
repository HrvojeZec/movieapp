import { REMINDER_DAYS_BEFORE } from "@/features/subscription/constants";
import { hasActiveSubscription, isPaidPlan } from "@/features/subscription/lib/plans";
import type { BillingInterval, PaidPlan } from "@/features/subscription/types";
import { DAY_MS } from "@/shared/lib/time";

export type ReminderType = "renewal_reminder" | "ending_reminder" | "trial_ending";

/** The subscription fields a reminder is decided from (as stored on the user). */
export interface ReminderCandidate {
  userId: string;
  subscriptionId?: string;
  subscriptionStatus?: string;
  subscriptionPlan?: string;
  subscriptionInterval?: BillingInterval;
  currentPeriodEnd?: Date | null;
  cancelAt?: Date | null;
  trialEnd?: Date | null;
}

export interface DueReminder {
  userId: string;
  type: ReminderType;
  /** When the subscription renews, ends or leaves its trial. */
  date: Date;
  plan: PaidPlan;
  interval: BillingInterval;
  dedupeKey: string;
}

/**
 * One key per subscription, kind and date, so a missed or repeated cron run (or the Stripe
 * trial_will_end webhook, which uses the same key) never sends a reminder twice.
 */
export const reminderDedupeKey = (type: ReminderType, subscriptionId: string, date: Date) =>
  `${type}:${subscriptionId}:${date.toISOString().slice(0, 10)}`;

/** What happens next for this subscription: a scheduled end wins over a trial or a renewal. */
function nextEvent(candidate: ReminderCandidate): { type: ReminderType; date: Date } | null {
  if (candidate.cancelAt) return { type: "ending_reminder", date: candidate.cancelAt };
  if (candidate.subscriptionStatus === "trialing" && candidate.trialEnd) {
    return { type: "trial_ending", date: candidate.trialEnd };
  }
  return candidate.currentPeriodEnd
    ? { type: "renewal_reminder", date: candidate.currentPeriodEnd }
    : null;
}

/**
 * Subscriptions that renew, end or leave their trial within the next REMINDER_DAYS_BEFORE days.
 * The window (not an exact day) means a missed daily run still reminds, just later.
 */
export function getDueReminders(candidates: ReminderCandidate[], now: Date): DueReminder[] {
  const windowEnd = now.getTime() + REMINDER_DAYS_BEFORE * DAY_MS;

  return candidates.flatMap((candidate) => {
    const { subscriptionId, subscriptionPlan } = candidate;
    if (!subscriptionId || !isPaidPlan(subscriptionPlan)) return [];
    if (!hasActiveSubscription(candidate.subscriptionStatus)) return [];

    const event = nextEvent(candidate);
    if (!event) return [];
    const at = event.date.getTime();
    if (at <= now.getTime() || at > windowEnd) return [];

    return [
      {
        userId: candidate.userId,
        type: event.type,
        date: event.date,
        plan: subscriptionPlan,
        interval: candidate.subscriptionInterval ?? "month",
        dedupeKey: reminderDedupeKey(event.type, subscriptionId, event.date),
      },
    ];
  });
}
