"use client";
import { Container, Group, Skeleton, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { AlertCircle, Check } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useConfirmCheckout } from "@/features/checkout/hooks/useConfirmCheckout";
import { SUBSCRIPTION_PLANS } from "@/entities/subscription/constants";
import { SubscriptionTicket } from "@/entities/subscription/ui/SubscriptionTicket/SubscriptionTicket";
import { ROUTES } from "@/shared/routes";
import { LinkButton } from "@/shared/ui/LinkButton/LinkButton";
import classes from "./SubscriptionSuccessView.module.scss";

const TICKET_SKELETON_HEIGHT = 190;

export function SubscriptionSuccessView() {
  const sessionId = useSearchParams().get("session_id");
  const { plan, error, loading } = useConfirmCheckout(sessionId);

  if (loading) {
    return (
      <Container size={560} py="xl">
        <Stack gap="lg" aria-busy="true" aria-label="Confirming your subscription">
          <Skeleton height={48} circle />
          <Skeleton height={32} width="60%" />
          <Skeleton height={TICKET_SKELETON_HEIGHT} radius="md" />
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size={560} py="xl">
        <Stack gap="md" align="flex-start">
          <ThemeIcon size={48} radius="xl" color="red" variant="light">
            <AlertCircle size={26} />
          </ThemeIcon>
          <Title order={1} size="h2" c="white">
            We couldn&apos;t confirm your subscription
          </Title>
          <Text c="gray.3">{error}</Text>
          <Text c="dimmed" size="sm">
            If the payment went through, your plan shows up in your profile within a minute.
          </Text>
          <Group gap="sm" mt="sm">
            <LinkButton href={ROUTES.pricing}>Back to pricing</LinkButton>
            <LinkButton href={ROUTES.profile} variant="default">
              View profile
            </LinkButton>
          </Group>
        </Stack>
      </Container>
    );
  }

  const planDetails = SUBSCRIPTION_PLANS.find((details) => details.id === plan);
  const isPaid = planDetails && planDetails.price > 0;

  return (
    <Container size={560} py="xl">
      <Stack gap="lg" align="flex-start">
        <ThemeIcon size={48} radius="xl" color="green" className={classes.confirmed}>
          <Check size={28} strokeWidth={3} />
        </ThemeIcon>

        <div>
          <Title order={1} size="h2" c="white">
            {isPaid ? `You're on ${planDetails.name}` : "Subscription confirmed"}
          </Title>
          <Text c="gray.3" mt={6}>
            {isPaid
              ? "Your subscription is active. Here's what it includes."
              : "It can take a minute to show up in your profile."}
          </Text>
        </div>

        {isPaid && <SubscriptionTicket plan={planDetails} />}

        <Group gap="sm">
          <LinkButton href={ROUTES.home}>Browse movies</LinkButton>
          <LinkButton href={ROUTES.profile} variant="default">
            View profile
          </LinkButton>
        </Group>

        <Text size="xs" c="dimmed">
          Payments run in Stripe test mode, so no real money was charged.
        </Text>
      </Stack>
    </Container>
  );
}
