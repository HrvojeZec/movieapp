import type { NotificationsResponse, ReadSelection } from "@/entities/notification/types";

/** The bell's state after marking notifications as read, before the server confirms. */
export function markReadLocally(
  state: NotificationsResponse,
  selection: ReadSelection,
): NotificationsResponse {
  if ("all" in selection) {
    return {
      notifications: state.notifications.map((notification) => ({ ...notification, read: true })),
      unreadCount: 0,
    };
  }

  const ids = new Set(selection.ids);
  const newlyRead = state.notifications.filter(({ id, read }) => ids.has(id) && !read).length;
  return {
    notifications: state.notifications.map((notification) =>
      ids.has(notification.id) ? { ...notification, read: true } : notification,
    ),
    unreadCount: Math.max(0, state.unreadCount - newlyRead),
  };
}
