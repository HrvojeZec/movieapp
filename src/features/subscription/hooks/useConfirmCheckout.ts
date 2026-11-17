import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/features/auth/api/query-keys";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { AuthUser } from "@/features/auth/types";
import { getEffectivePlan } from "@/features/subscription/lib/entitlements";
import { API_ROUTES } from "@/shared/api-routes";
import { HttpError, postJson } from "@/shared/lib/http";

interface CheckoutConfirmation {
  user: AuthUser | null;
}

/**
 * Confirms a finished Stripe Checkout so the new plan shows right away (the webhook stays the
 * source of truth). Returns the confirmed plan, an error message, or whether it is still running.
 */
export function useConfirmCheckout(sessionId: string | null) {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const confirmation = useMutation({
    mutationFn: (id: string) =>
      postJson<CheckoutConfirmation>(API_ROUTES.stripe.checkoutSuccess, { sessionId: id }),
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
        ? // The API says what went wrong (e.g. the payment is still processing)
          confirmation.error instanceof HttpError
          ? confirmation.error.message
          : "Couldn't confirm your subscription"
        : null;

  // From the confirmation itself: the cached session may still hold the plan from before
  const confirmedUser = confirmation.data?.user;
  const plan = confirmedUser ? getEffectivePlan(confirmedUser) : null;

  return { plan, error, loading: !error && !confirmation.isSuccess };
}
