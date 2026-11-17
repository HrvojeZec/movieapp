"use client";
import { Container, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { SUBSCRIPTION_PLANS } from "@/features/subscription/constants";
import { useCheckout } from "@/features/subscription/hooks/useCheckout";
import { hasActiveSubscription, isPaidPlan } from "@/features/subscription/lib/plans";
import type { PlanDetails, SubscriptionPlan } from "@/features/subscription/types";
import { PlanCard } from "@/features/subscription/ui/PlanCard/PlanCard";

// Cards fade in one after another
const CARD_ANIMATION_STEP_MS = 100;

export function PricingView() {
  const { user, loading: authLoading } = useAuth();
  const { subscribe, pendingPlan } = useCheckout();

  const isSubscribed = hasActiveSubscription(user?.subscriptionStatus);
  const currentPlan: SubscriptionPlan =
    isSubscribed && isPaidPlan(user?.subscriptionPlan) ? user.subscriptionPlan : "basic";

  const getButtonLabel = (plan: PlanDetails) => {
    if (plan.id === currentPlan) return "Current Plan";
    if (plan.id === "basic") return "Free";
    if (isSubscribed) return "Plan changes coming soon";
    return `Subscribe to ${plan.name}`;
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl" align="center">
        <div data-aos="fade-down">
          <Title size="3rem" fw={700} ta="center" c="white" mb="md">
            Choose Your Plan
          </Title>
          <Text size="xl" ta="center" c="dimmed" maw={600}>
            Unlock premium features and enhance your movie discovery experience
          </Text>
        </div>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" w="100%">
          {SUBSCRIPTION_PLANS.map((plan, index) => {
            const paidPlan = isPaidPlan(plan.id) ? plan.id : null;
            const canSubscribe = paidPlan !== null && !isSubscribed;

            return (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrent={plan.id === currentPlan}
                buttonLabel={getButtonLabel(plan)}
                // The session decides between checkout and login, so wait for it
                disabled={!canSubscribe || pendingPlan != null || authLoading}
                pending={pendingPlan === plan.id}
                onSubscribe={() => paidPlan && subscribe(paidPlan)}
                animationDelay={index * CARD_ANIMATION_STEP_MS}
              />
            );
          })}
        </SimpleGrid>

        <div data-aos="fade-up" data-aos-delay="400">
          <Text ta="center" c="dimmed" size="sm">
            Payments run in Stripe test mode. Use card 4242 4242 4242 4242 with any future date and
            any CVC.
          </Text>
        </div>
      </Stack>
    </Container>
  );
}
