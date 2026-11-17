"use client";
import type { ReactNode } from "react";
import { Center, Loader, Paper, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { Lock } from "lucide-react";
import { useEntitlements } from "@/features/subscription/hooks/useEntitlements";
import { getPlanName, requiredPlanFor } from "@/features/subscription/lib/entitlements";
import type { Feature } from "@/features/subscription/types";
import { ROUTES } from "@/shared/routes";
import { LinkButton } from "@/shared/ui/LinkButton/LinkButton";
import classes from "./LockedFeature.module.scss";

interface LockedFeatureProps {
  feature: Feature;
  /** What the feature is, e.g. "Your watchlist". */
  title: string;
  children: ReactNode;
}

/** Shows the feature when the plan includes it, otherwise an upgrade prompt in its place. */
export function LockedFeature({ feature, title, children }: LockedFeatureProps) {
  const { can, loading } = useEntitlements();

  if (loading) {
    return (
      <Center py="xl">
        <Loader size="sm" />
      </Center>
    );
  }
  if (can(feature)) return children;

  const planName = getPlanName(requiredPlanFor(feature));
  return (
    <Paper p="xl" className={classes.locked}>
      <Stack align="center" gap="sm">
        <ThemeIcon size="xl" radius="xl" variant="light">
          <Lock size={20} />
        </ThemeIcon>
        <Title order={2} size="h4" c="white" ta="center">
          {title}
        </Title>
        <Text c="dimmed" ta="center" maw={420}>
          Available on the {planName} plan. Upgrade to unlock it.
        </Text>
        <LinkButton href={ROUTES.pricing} mt="xs">
          See {planName}
        </LinkButton>
      </Stack>
    </Paper>
  );
}
