import { useId } from "react";
import { Alert, Badge, Button, Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { AlertTriangle, CreditCard, Crown } from "lucide-react";
import type { AuthUser } from "@/entities/user/types";
import {
  PLAN_BADGE_COLORS,
  PLAN_SUMMARIES,
  SUBSCRIPTION_STATUS_DISPLAY,
} from "@/features/manage-subscription/constants";
import { SUBSCRIPTION_PLANS } from "@/entities/subscription/constants";
import { CancelSubscriptionModal } from "@/features/manage-subscription/ui/CancelSubscriptionModal/CancelSubscriptionModal";
import { useManageSubscription } from "@/features/manage-subscription/hooks/useManageSubscription";
import { getBillingSummary } from "@/features/manage-subscription/lib/billing";
import { getEffectivePlan, getPlanName } from "@/entities/subscription/lib/entitlements";
import { isPaidPlan } from "@/entities/subscription/lib/plans";
import { ROUTES } from "@/shared/routes";
import { COLORS } from "@/shared/theme/colors";
import { LinkButton } from "@/shared/ui/LinkButton/LinkButton";

export function SubscriptionPanel({ user }: { user: AuthUser }) {
  // Same rule as the server checks: trialing and past_due still have the paid plan
  const plan = getEffectivePlan(user);
  const planName = getPlanName(plan);
  const isPaid = isPaidPlan(plan);
  // The free plan has no subscription, so there is no status to show
  const status =
    isPaid && user.subscriptionStatus
      ? (SUBSCRIPTION_STATUS_DISPLAY[user.subscriptionStatus] ?? {
          label: user.subscriptionStatus,
          color: "gray",
        })
      : null;
  const planDetails = SUBSCRIPTION_PLANS.find((details) => details.id === plan);
  const billing =
    isPaid && planDetails && user.subscription
      ? getBillingSummary(planDetails, user.subscriptionStatus, user.subscription)
      : null;
  const titleId = useId();
  const manage = useManageSubscription();
  const [cancelOpened, cancelModal] = useDisclosure(false);
  const isCanceled = !!user.subscription?.cancelAt;

  return (
    <Paper component="section" aria-labelledby={titleId} p="xl" radius="md">
      <Group gap="sm" mb="md">
        <CreditCard size={24} color={COLORS.primary} />
        <Title id={titleId} order={2} size="lg" c="white">
          Subscription
        </Title>
      </Group>

      <Stack gap="md">
        <Group gap="sm">
          <Badge
            variant="filled"
            color={PLAN_BADGE_COLORS[plan]}
            size="lg"
            tt="none"
            leftSection={isPaid ? <Crown size={14} /> : null}
          >
            {isPaid ? `${planName} plan` : "Free plan"}
          </Badge>
          {status && (
            <Badge variant="outline" color={status.color} tt="none">
              {status.label}
            </Badge>
          )}
        </Group>

        <Text c="gray.3" size="sm">
          {PLAN_SUMMARIES[plan]}
        </Text>

        {billing && (
          <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="md" verticalSpacing="xs">
            <BillingFact label="Billing" value={billing.interval} />
            <BillingFact label="Price" value={billing.price} />
            <BillingFact label="Coming up" value={billing.date} />
          </SimpleGrid>
        )}

        {user.subscriptionStatus === "past_due" && (
          <Alert color="yellow" variant="light" icon={<AlertTriangle size={18} />}>
            <Stack gap="xs" align="flex-start">
              <Text size="sm">
                Your last payment failed. Stripe will try again over the next few days; if it keeps
                failing, your plan switches to Basic.
              </Text>
              <Button
                size="xs"
                color="yellow"
                variant="light"
                onClick={manage.openPortal}
                loading={manage.openingPortal}
              >
                Update payment method
              </Button>
            </Stack>
          </Alert>
        )}

        <Group gap="sm" mt="sm">
          {!isPaid && (
            <LinkButton href={ROUTES.pricing} size="sm">
              See plans
            </LinkButton>
          )}
          {isPaid && isCanceled && (
            <Button size="sm" onClick={manage.resume} loading={manage.resuming}>
              Resume subscription
            </Button>
          )}
          {user.stripeCustomerId && (
            <Button
              size="sm"
              variant="outline"
              onClick={manage.openPortal}
              loading={manage.openingPortal}
            >
              Manage billing
            </Button>
          )}
          {isPaid && !isCanceled && user.subscription && (
            <Button size="sm" variant="subtle" color="red" onClick={cancelModal.open}>
              Cancel subscription
            </Button>
          )}
        </Group>
      </Stack>

      {isPaid && user.subscription && (
        <CancelSubscriptionModal
          opened={cancelOpened}
          onClose={cancelModal.close}
          onConfirm={() => manage.cancel(cancelModal.close)}
          confirming={manage.canceling}
          plan={plan}
          periodEnd={user.subscription.currentPeriodEnd}
        />
      )}
    </Paper>
  );
}

function BillingFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="sm" c="white">
        {value}
      </Text>
    </div>
  );
}
