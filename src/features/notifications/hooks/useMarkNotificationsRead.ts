import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markNotificationsRead } from "@/features/notifications/api/notifications.api";
import { notificationKeys } from "@/features/notifications/api/queries";
import { markReadLocally } from "@/features/notifications/lib/read-state";
import type { NotificationsResponse, ReadSelection } from "@/features/notifications/types";

/** Marks notifications as read right away in the bell, then confirms with the server. */
export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: markNotificationsRead,
    onMutate: async (selection: ReadSelection) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });
      const previous = queryClient.getQueryData<NotificationsResponse>(notificationKeys.all);
      if (previous) {
        queryClient.setQueryData(notificationKeys.all, markReadLocally(previous, selection));
      }
      return { previous };
    },
    onError: (_error, _selection, context) => {
      if (context?.previous) queryClient.setQueryData(notificationKeys.all, context.previous);
    },
    // The server's count also covers unread notifications older than the ones shown
    onSuccess: ({ unreadCount }) =>
      queryClient.setQueryData<NotificationsResponse>(notificationKeys.all, (current) =>
        current ? { ...current, unreadCount } : current,
      ),
  });

  return {
    markRead: (ids: string[]) => mutation.mutate({ ids }),
    markAllRead: () => mutation.mutate({ all: true }),
  };
}
