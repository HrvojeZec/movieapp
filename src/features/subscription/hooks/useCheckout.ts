import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { PaidPlan } from "@/features/subscription/types";
import { toApiError } from "@/shared/lib/api-error";
import { fetchJson } from "@/shared/lib/http";
import { ROUTES } from "@/shared/routes";

/** Starts Stripe Checkout for a plan; logged-out users are sent to login first. */
export function useCheckout() {
  const { user } = useAuth();
  const router = useRouter();

  const checkout = useMutation({
    mutationFn: (plan: PaidPlan) =>
      fetchJson<{ url: string }>("/api/stripe/create-checkout-session", {
        method: "POST",
        body: JSON.stringify({ plan }),
      }),
    // Stays pending while the browser leaves for Stripe, so the buttons stay disabled
    onSuccess: ({ url }) => window.location.assign(url),
    onError: (error) => {
      notifications.show({
        title: "Checkout failed",
        message: toApiError(error).message,
        color: "red",
      });
    },
  });

  const subscribe = (plan: PaidPlan) => {
    if (!user) {
      router.push(ROUTES.login);
      return;
    }
    checkout.mutate(plan);
  };

  return {
    subscribe,
    pendingPlan: checkout.isPending || checkout.isSuccess ? checkout.variables : null,
  };
}
