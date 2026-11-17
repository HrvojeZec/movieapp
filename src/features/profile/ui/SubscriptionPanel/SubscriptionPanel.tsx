import { useRouter } from "next/navigation";
import { Badge, Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { CreditCard, Crown } from "lucide-react";
import type { AuthUser } from "@/features/auth/types";
import { PLAN_BADGE_COLORS, PLAN_SUMMARIES } from "@/features/profile/constants";
import { hasActiveSubscription, isPaidPlan } from "@/features/subscription/lib/plans";
import { ROUTES } from "@/shared/routes";
import { COLORS } from "@/shared/theme/colors";

export function SubscriptionPanel({ user }: { user: AuthUser }) {
  const router = useRouter();
  const plan = isPaidPlan(user.subscriptionPlan) ? user.subscriptionPlan : "basic";
  // Same rule as the server: trialing and past_due still have access
  const isActive = hasActiveSubscription(user.subscriptionStatus);

  return (
    <Paper p="xl" radius="md">
      <Group gap="sm" mb="md">
        <CreditCard size={24} color={COLORS.primary} />
        <Title size="lg" c="white">
          Subscription
        </Title>
      </Group>

      <Stack gap="md">
        <Group gap="md">
          <Badge
            variant="filled"
            color={PLAN_BADGE_COLORS[plan]}
            size="lg"
            leftSection={isPaidPlan(plan) ? <Crown size={14} /> : null}
          >
            {plan.toUpperCase()} PLAN
          </Badge>
          <Badge variant="outline" color={isActive ? "green" : "gray"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </Group>

        <Text c="gray.3" size="sm">
          {PLAN_SUMMARIES[plan]}
        </Text>

        {!isActive && (
          <Group gap="sm" mt="sm">
            <Button size="sm" color="blue" onClick={() => router.push(ROUTES.pricing)}>
              Upgrade to Premium
            </Button>
          </Group>
        )}
      </Stack>
    </Paper>
  );
}
