import { useMutation } from "@tanstack/react-query";
import { useAppRouter } from "@/shared/hooks/useAppRouter";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { BillingInterval, PaidPlan } from "@/features/subscription/types";
import { toApiError } from "@/shared/lib/api-error";
import { API_ROUTES } from "@/shared/api-routes";
import { postJson } from "@/shared/lib/http";
import { notifyError } from "@/shared/lib/notify";
import { ROUTES } from "@/shared/routes";

interface CheckoutRequest {
  plan: PaidPlan;
  interval: BillingInterval;
}

/** Starts Stripe Checkout for a plan; logged-out users are sent to login first. */
export function useCheckout() {
  const { user } = useAuth();
  const router = useAppRouter();

  const checkout = useMutation({
    mutationFn: (request: CheckoutRequest) =>
      postJson<{ url: string }>(API_ROUTES.stripe.createCheckoutSession, request),
    // Stays pending while the browser leaves for Stripe, so the buttons stay disabled
    onSuccess: ({ url }) => window.location.assign(url),
    onError: (error) => notifyError("Checkout failed", toApiError(error).message),
  });

  const subscribe = (plan: PaidPlan, interval: BillingInterval) => {
    if (!user) {
      router.push(ROUTES.login);
      return;
    }
    checkout.mutate({ plan, interval });
  };

  return {
    subscribe,
    pendingPlan: checkout.isPending || checkout.isSuccess ? checkout.variables.plan : null,
  };
}
