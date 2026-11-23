"use client";
import { useState } from "react";
import { Alert, Container, SegmentedControl, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { FlaskConical } from "lucide-react";
import { APP_NAME } from "@/shared/constants";
import { useAuth } from "@/entities/user/hooks/useAuth";
import { SUBSCRIPTION_PLANS, TRIAL_DAYS } from "@/entities/subscription/constants";
import { useCheckout } from "@/features/checkout/hooks/useCheckout";
import { useManageSubscription } from "@/features/manage-subscription/hooks/useManageSubscription";
import { getEffectivePlan } from "@/entities/subscription/lib/entitlements";
import { hasActiveSubscription, isPaidPlan } from "@/entities/subscription/lib/plans";
import type { BillingInterval, PlanDetails, SubscriptionPlan } from "@/entities/subscription/types";
import { PlanCard } from "@/features/checkout/ui/PlanCard/PlanCard";
import { Reveal } from "@/shared/ui/motion/Reveal";
import BlurText from "@/shared/vendor/react-bits/BlurText/BlurText";
import classes from "./PricingView.module.scss";

// Words of the subtitle come into focus one after another
const SUBTITLE_WORD_DELAY_MS = 60;

const INTERVAL_OPTIONS = [
  { label: "Monthly", value: "month" },
  { label: "Yearly", value: "year" },
];

export function PricingView() {
  const { user, loading: authLoading } = useAuth();
  const { subscribe, pendingPlan } = useCheckout();
  const { openPortal, openingPortal } = useManageSubscription();
  const [interval, setBillingInterval] = useState<BillingInterval>("month");

  // Unknown until the session loads: marking Basic meanwhile would flash the wrong plan for
  // subscribers on every page load
  const currentPlan: SubscriptionPlan | null = authLoading ? null : getEffectivePlan(user ?? {});
  // Any live subscription blocks a second checkout, even one whose price we don't recognize
  const isSubscribed = hasActiveSubscription(user?.subscriptionStatus);
  // Visitors are offered the trial too: signing up is the first step to it. Hidden while the
  // session loads, so it doesn't flash for returning subscribers
  const offersTrial = !authLoading && !isSubscribed && (user?.trialAvailable ?? true);

  const getButtonLabel = (plan: PlanDetails) => {
    if (plan.id === currentPlan) return "Current Plan";
    if (plan.id === "basic") return "Free";
    // Switching plans or billing period happens in the Stripe Customer Portal (with proration)
    if (isSubscribed) return `Switch to ${plan.name}`;
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

        {/* A note, not an alert: it is there on load and screen readers shouldn't announce it */}
        <Alert
          role="note"
          title="Demo"
          icon={<FlaskConical size={18} />}
          color="yellow"
          variant="light"
          w="100%"
          maw={720}
        >
          {APP_NAME} is a portfolio project. Payments run in Stripe test mode, so no real money is
          ever charged. Subscribe with the card 4242 4242 4242 4242, any future expiry date and any
          CVC.
        </Alert>

        <Stack gap={6} align="center">
          <SegmentedControl
            aria-label="Billing period"
            data={INTERVAL_OPTIONS}
            value={interval}
            onChange={(value) => setBillingInterval(value as BillingInterval)}
            radius="xl"
          />
          <Text size="sm" c="dimmed">
            Yearly billing gets you two months free
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" w="100%">
          {SUBSCRIPTION_PLANS.map((plan, index) => {
            const paidPlan = isPaidPlan(plan.id) ? plan.id : null;
            const canSwitch = paidPlan !== null && isSubscribed && plan.id !== currentPlan;
            const canSubscribe = (paidPlan !== null && !isSubscribed) || canSwitch;

            return (
              <Reveal key={plan.id} index={index}>
                <PlanCard
                  plan={plan}
                  interval={interval}
                  isCurrent={plan.id === currentPlan}
                  buttonLabel={getButtonLabel(plan)}
                  // The session decides between checkout and login, so wait for it
                  disabled={!canSubscribe || pendingPlan != null || openingPortal || authLoading}
                  pending={pendingPlan === plan.id}
                  trialDays={offersTrial ? TRIAL_DAYS : undefined}
                  onSubscribe={() => {
                    if (canSwitch) openPortal();
                    else if (paidPlan) subscribe(paidPlan, interval);
                  }}
                />
              </Reveal>
            );
          })}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
