import connectDB from "@/server/db/mongodb";
import Notification from "@/server/models/Notification";
import type { NotificationInput } from "@/features/notifications/types";

const DUPLICATE_KEY = 11000;

const isDuplicateKeyError = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error && error.code === DUPLICATE_KEY;

/**
 * Stores a notification for the user. Returns true only when it is new: the same dedupeKey for
 * the same user is ignored, so a repeated webhook or cron run never notifies (or emails) twice.
 */
export async function notifyUser(userId: string, input: NotificationInput): Promise<boolean> {
  await connectDB();
  try {
    await Notification.create({ userId, ...input });
    return true;
  } catch (error) {
    if (isDuplicateKeyError(error)) return false;
    throw error;
  }
}
