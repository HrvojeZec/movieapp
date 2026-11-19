import connectDB from "@/server/db/mongodb";
import User from "@/server/models/User";
import { DAY_MS } from "@/shared/lib/time";
import { getReminderNotification } from "@/entities/subscription/lib/reminder-events";
import { notifyUser } from "@/entities/notification/server/notify";
import { ENTITLED_STATUSES, REMINDER_DAYS_BEFORE } from "@/entities/subscription/constants";
import { getDueReminders, type ReminderCandidate } from "@/entities/subscription/lib/reminders";

/**
 * The daily job: notifies (and emails) subscribers whose plan renews, ends or leaves its trial
 * within the next few days. Each reminder has a stable dedupe key, so running it twice, or after
 * a missed day, never sends one twice. One failing user doesn't stop the others.
 */
export async function sendSubscriptionReminders(
  now: Date,
): Promise<{ checked: number; sent: number }> {
  await connectDB();
  const inWindow = { $gt: now, $lte: new Date(now.getTime() + REMINDER_DAYS_BEFORE * DAY_MS) };

  const users = await User.find({
    subscriptionId: { $exists: true, $ne: null },
    subscriptionStatus: { $in: [...ENTITLED_STATUSES] },
    $or: [{ cancelAt: inWindow }, { trialEnd: inWindow }, { currentPeriodEnd: inWindow }],
  }).select(
    "subscriptionId subscriptionStatus subscriptionPlan subscriptionInterval currentPeriodEnd cancelAt trialEnd",
  );

  const candidates: ReminderCandidate[] = users.map((user) => ({
    userId: user._id.toString(),
    subscriptionId: user.subscriptionId,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionPlan: user.subscriptionPlan,
    subscriptionInterval: user.subscriptionInterval,
    currentPeriodEnd: user.currentPeriodEnd,
    cancelAt: user.cancelAt,
    trialEnd: user.trialEnd,
  }));

  let sent = 0;
  for (const reminder of getDueReminders(candidates, now)) {
    try {
      const isNew = await notifyUser(reminder.userId, getReminderNotification(reminder), {
        email: true,
      });
      if (isNew) sent++;
    } catch (error) {
      console.error(`Reminder ${reminder.dedupeKey} failed:`, error);
    }
  }
  return { checked: candidates.length, sent };
}
