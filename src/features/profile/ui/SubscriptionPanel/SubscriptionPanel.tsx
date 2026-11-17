import { Badge, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { CreditCard, Crown } from "lucide-react";
import type { AuthUser } from "@/features/auth/types";
import {
  PLAN_BADGE_COLORS,
  PLAN_SUMMARIES,
  SUBSCRIPTION_STATUS_DISPLAY,
} from "@/features/profile/constants";
import { getEffectivePlan, getPlanName } from "@/features/subscription/lib/entitlements";
import { isPaidPlan } from "@/features/subscription/lib/plans";
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

  return (
    <Paper p="xl" radius="md">
      <Group gap="sm" mb="md">
        <CreditCard size={24} color={COLORS.primary} />
        <Title order={2} size="lg" c="white">
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

        <Group gap="sm" mt="sm">
          <LinkButton href={ROUTES.pricing} size="sm" variant={isPaid ? "outline" : "filled"}>
            {isPaid ? "Manage plan" : "See plans"}
          </LinkButton>
        </Group>
      </Stack>
    </Paper>
  );
}
