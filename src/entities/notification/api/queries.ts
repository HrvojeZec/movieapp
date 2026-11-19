import { queryOptions } from "@tanstack/react-query";
import { fetchNotifications } from "@/entities/notification/api/notifications.api";
import { MINUTE_MS } from "@/shared/lib/time";

export const notificationKeys = {
  all: ["notifications"] as const,
};

// Polled rather than pushed: a minute is fresh enough for subscription news, and it works on
// serverless hosting without a socket server
export const notificationsQuery = queryOptions({
  queryKey: notificationKeys.all,
  queryFn: fetchNotifications,
  refetchInterval: MINUTE_MS,
  refetchOnWindowFocus: true,
  staleTime: 0,
});
