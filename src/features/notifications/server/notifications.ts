import connectDB from "@/server/db/mongodb";
import Notification, { type INotification } from "@/server/models/Notification";
import { NOTIFICATIONS_LIMIT } from "@/features/notifications/constants";
import type { NotificationDto } from "@/features/notifications/types";
import type { MarkReadSelection } from "@/features/notifications/validations/notifications.schema";

const toDto = (notification: INotification): NotificationDto => ({
  id: notification._id.toString(),
  type: notification.type,
  title: notification.title,
  body: notification.body,
  link: notification.link,
  read: notification.readAt !== null,
  createdAt: notification.createdAt.toISOString(),
});

const countUnread = (userId: string) => Notification.countDocuments({ userId, readAt: null });

/** The user's latest notifications and how many are unread in total. */
export async function listNotifications(
  userId: string,
): Promise<{ notifications: NotificationDto[]; unreadCount: number }> {
  await connectDB();
  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ userId }).sort({ createdAt: -1 }).limit(NOTIFICATIONS_LIMIT),
    countUnread(userId),
  ]);
  return { notifications: notifications.map(toDto), unreadCount };
}

/** Marks some or all of the user's notifications as read; returns how many stay unread. */
export async function markNotificationsRead(
  userId: string,
  selection: MarkReadSelection,
): Promise<number> {
  await connectDB();
  // Scoped to the user, so IDs of someone else's notifications change nothing
  const filter = "ids" in selection ? { userId, _id: { $in: selection.ids } } : { userId };
  await Notification.updateMany({ ...filter, readAt: null }, { readAt: new Date() });
  return countUnread(userId);
}
