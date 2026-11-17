"use client";
import { Container, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { SUBSCRIPTION_PLANS } from "@/features/subscription/constants";
import { useCheckout } from "@/features/subscription/hooks/useCheckout";
import { getEffectivePlan } from "@/features/subscription/lib/entitlements";
import { hasActiveSubscription, isPaidPlan } from "@/features/subscription/lib/plans";
import type { PlanDetails, SubscriptionPlan } from "@/features/subscription/types";
import { PlanCard } from "@/features/subscription/ui/PlanCard/PlanCard";
import { Reveal } from "@/shared/ui/motion/Reveal";
import BlurText from "@/shared/vendor/react-bits/BlurText/BlurText";
import classes from "./PricingView.module.scss";

// Words of the subtitle come into focus one after another
const SUBTITLE_WORD_DELAY_MS = 60;

export function PricingView() {
  const { user, loading: authLoading } = useAuth();
  const { subscribe, pendingPlan } = useCheckout();

  // Unknown until the session loads: marking Basic meanwhile would flash the wrong plan for
  // subscribers on every page load
  const currentPlan: SubscriptionPlan | null = authLoading ? null : getEffectivePlan(user ?? {});
  // Any live subscription blocks a second checkout, even one whose price we don't recognize
  const isSubscribed = hasActiveSubscription(user?.subscriptionStatus);

  const getButtonLabel = (plan: PlanDetails) => {
    if (plan.id === currentPlan) return "Current Plan";
    if (plan.id === "basic") return "Free";
    if (isSubscribed) return "Plan changes coming soon";
    return `Subscribe to ${plan.name}`;
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl" align="center">
        <div>
          <Title size="3rem" fw={700} ta="center" c="white" mb="md">
            Choose Your Plan
          </Title>
          <BlurText
            text="Unlock premium features and enhance your movie discovery experience"
            className={classes.subtitle}
            delay={SUBTITLE_WORD_DELAY_MS}
            trigger="load"
          />
        </div>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" w="100%">
          {SUBSCRIPTION_PLANS.map((plan, index) => {
            const paidPlan = isPaidPlan(plan.id) ? plan.id : null;
            const canSubscribe = paidPlan !== null && !isSubscribed;

            return (
              <Reveal key={plan.id} index={index}>
                <PlanCard
                  plan={plan}
                  isCurrent={plan.id === currentPlan}
                  buttonLabel={getButtonLabel(plan)}
                  // The session decides between checkout and login, so wait for it
                  disabled={!canSubscribe || pendingPlan != null || authLoading}
                  pending={pendingPlan === plan.id}
                  onSubscribe={() => paidPlan && subscribe(paidPlan)}
                />
              </Reveal>
            );
          })}
        </SimpleGrid>

        <Text ta="center" c="dimmed" size="sm">
          Payments run in Stripe test mode. Use card 4242 4242 4242 4242 with any future date and
          any CVC.
        </Text>
      </Stack>
    </Container>
  );
}
