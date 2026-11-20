import { useQuery } from "@tanstack/react-query";
import { notificationsQuery } from "@/entities/notification/api/queries";

/** The signed-in user's notifications for the bell (only rendered while logged in). */
export function useNotifications() {
  const { data, isPending, isError } = useQuery(notificationsQuery);
  return {
    notifications: data?.notifications ?? [],
    unreadCount: data?.unreadCount ?? 0,
    isPending,
    isError,
  };
}
