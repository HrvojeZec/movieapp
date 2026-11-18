import type { NotificationsResponse, ReadSelection } from "@/features/notifications/types";
import { API_ROUTES } from "@/shared/api-routes";
import { fetchJson, postJson } from "@/shared/lib/http";

export const fetchNotifications = () =>
  fetchJson<NotificationsResponse>(API_ROUTES.notifications.list);

/** Marks the given notifications, or all of them, as read; returns the remaining unread count. */
export const markNotificationsRead = (selection: ReadSelection) =>
  postJson<{ unreadCount: number }>(API_ROUTES.notifications.read, selection);
