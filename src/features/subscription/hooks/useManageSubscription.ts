import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/features/auth/api/query-keys";
import type { AuthUser } from "@/features/auth/types";
import { API_ROUTES } from "@/shared/api-routes";
import { toApiError } from "@/shared/lib/api-error";
import { postJson } from "@/shared/lib/http";
import { notifyError, notifySuccess } from "@/shared/lib/notify";

/** Cancel, resume and the Stripe Customer Portal for the signed-in subscriber. */
export function useManageSubscription() {
  const queryClient = useQueryClient();

  // The API answers with the updated user, so the profile changes without a refetch
  const updateSession = ({ user }: { user: AuthUser }) =>
    queryClient.setQueryData(authKeys.me, user);
  const showError = (title: string) => (error: unknown) =>
    notifyError(title, toApiError(error).message);

  const cancel = useMutation({
    mutationFn: () => postJson<{ user: AuthUser }>(API_ROUTES.subscription.cancel),
    onSuccess: (data) => {
      updateSession(data);
      notifySuccess("Subscription canceled", "You keep your plan until the end of the period.");
    },
    onError: showError("Couldn't cancel"),
  });

  const resume = useMutation({
    mutationFn: () => postJson<{ user: AuthUser }>(API_ROUTES.subscription.resume),
    onSuccess: (data) => {
      updateSession(data);
      notifySuccess("Subscription resumed", "Your plan renews as before.");
    },
    onError: showError("Couldn't resume"),
  });

  const portal = useMutation({
    mutationFn: () => postJson<{ url: string }>(API_ROUTES.subscription.portal),
    // Stays pending while the browser leaves for Stripe, so the button stays disabled
    onSuccess: ({ url }) => window.location.assign(url),
    onError: showError("Couldn't open billing"),
  });

  return {
    /** onDone runs only when the cancellation went through, e.g. to close a confirmation. */
    cancel: (onDone?: () => void) => cancel.mutate(undefined, { onSuccess: onDone }),
    canceling: cancel.isPending,
    resume: () => resume.mutate(),
    resuming: resume.isPending,
    openPortal: () => portal.mutate(),
    openingPortal: portal.isPending || portal.isSuccess,
  };
}
