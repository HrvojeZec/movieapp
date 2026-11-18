import connectDB from "@/server/db/mongodb";
import { sendEmail } from "@/server/email/send";
import Notification from "@/server/models/Notification";
import User from "@/server/models/User";
import { buildNotificationEmail } from "@/features/notifications/server/emails";
import type { NotificationInput } from "@/features/notifications/types";

const DUPLICATE_KEY = 11000;

const isDuplicateKeyError = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error && error.code === DUPLICATE_KEY;

interface NotifyOptions {
  /** Also email the notification (only when it is new). */
  email?: boolean;
}

/**
 * Stores a notification for the user. Returns true only when it is new: the same dedupeKey for
 * the same user is ignored, so a repeated webhook or cron run never notifies (or emails) twice.
 */
export async function notifyUser(
  userId: string,
  input: NotificationInput,
  options: NotifyOptions = {},
): Promise<boolean> {
  await connectDB();
  try {
    await Notification.create({ userId, ...input });
  } catch (error) {
    if (isDuplicateKeyError(error)) return false;
    throw error;
  }

  if (options.email) await emailNotification(userId, input);
  return true;
}

// Best effort: the notification is stored either way, and sendEmail itself never throws
async function emailNotification(userId: string, input: NotificationInput): Promise<void> {
  try {
    const user = await User.findById(userId).select("name email");
    if (user) await sendEmail(buildNotificationEmail(input, user));
  } catch (error) {
    console.error(`Couldn't email the "${input.type}" notification:`, error);
  }
}
