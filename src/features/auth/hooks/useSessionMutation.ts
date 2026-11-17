import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { authKeys } from "@/features/auth/api/queries";
import type { AuthUser } from "@/features/auth/types";
import { toApiError } from "@/shared/lib/api-error";
import { fetchJson } from "@/shared/lib/http";

/** Shared by login and registration: both start a session and return the user. */
export function useSessionMutation<TVariables>(
  path: string,
  messages: { successTitle: string; successMessage: string; failureTitle: string },
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: TVariables) =>
      fetchJson<{ user: AuthUser }>(path, { method: "POST", body: JSON.stringify(variables) }),
    onSuccess: ({ user }) => {
      queryClient.setQueryData(authKeys.me, user);
      notifications.show({
        title: messages.successTitle,
        message: messages.successMessage,
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: messages.failureTitle,
        message: toApiError(error).message,
        color: "red",
      });
    },
  });
}
