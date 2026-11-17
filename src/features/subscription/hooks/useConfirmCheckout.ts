import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/features/auth/api/query-keys";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { API_ROUTES } from "@/shared/api-routes";
import { postJson } from "@/shared/lib/http";

/**
 * Confirms a finished Stripe Checkout so the new plan shows right away (the webhook stays the
 * source of truth). Returns an error message, or whether the confirmation is still running.
 */
export function useConfirmCheckout(sessionId: string | null) {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const confirmation = useMutation({
    mutationFn: (id: string) =>
      postJson<unknown>(API_ROUTES.stripe.checkoutSuccess, { sessionId: id }),
    // Refetch the session so the navbar and profile show the new plan right away
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authKeys.me }),
  });
  const { mutate: confirm } = confirmation;

  // The user object changes when the session is refetched; confirm each checkout only once
  const confirmedSessionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!sessionId || !user || confirmedSessionRef.current === sessionId) return;
    confirmedSessionRef.current = sessionId;
    confirm(sessionId);
  }, [sessionId, user, confirm]);

  const error = !sessionId
    ? "No session ID found"
    : !authLoading && !user
      ? "Log in to finish activating your subscription"
      : confirmation.isError
        ? "Failed to process payment"
        : null;

  return { user, error, loading: !error && !confirmation.isSuccess };
}
