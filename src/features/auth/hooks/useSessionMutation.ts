import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/entities/user/api/query-keys";
import type { AuthUser } from "@/entities/user/types";
import { toApiError } from "@/shared/lib/api-error";
import { notifyError, notifySuccess } from "@/shared/lib/notify";

interface SessionMessages {
  successTitle: string;
  successMessage: string;
  failureTitle: string;
}

/** Shared by login and registration: both start a session and return the user. */
export function useSessionMutation<TVariables>(
  request: (variables: TVariables) => Promise<{ user: AuthUser }>,
  messages: SessionMessages,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: request,
    onSuccess: ({ user }) => {
      queryClient.setQueryData(authKeys.me, user);
      notifySuccess(messages.successTitle, messages.successMessage);
    },
    onError: (error) => notifyError(messages.failureTitle, toApiError(error).message),
  });
}
