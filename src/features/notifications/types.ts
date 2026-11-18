import type { NOTIFICATION_TYPES } from "@/features/notifications/constants";

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface NotificationInput {
  type: NotificationType;
  title: string;
  body: string;
  /** An internal route the notification opens, e.g. "/profile". */
  link?: string;
  /** The same event never creates two notifications for one user. */
  dedupeKey: string;
}

/** A notification as the API returns it. */
export interface NotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  /** ISO date */
  createdAt: string;
}
