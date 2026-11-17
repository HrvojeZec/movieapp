"use client";
import { Button, Center, Container, Loader, Paper, Stack, Text, Title } from "@mantine/core";
import { CheckCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useConfirmCheckout } from "@/features/subscription/hooks/useConfirmCheckout";
import { ROUTES } from "@/shared/routes";
import { COLORS } from "@/shared/theme/colors";

const LOADING_HEIGHT = 400;

export function SubscriptionSuccessView() {
  const router = useRouter();
  const sessionId = useSearchParams().get("session_id");
  const { user, error, loading } = useConfirmCheckout(sessionId);

  if (loading) {
    return (
      <Container size="sm" py="xl">
        <Center h={LOADING_HEIGHT}>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text c="white">Processing your payment...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="sm" py="xl">
        <Paper p="xl" radius="md">
          <Stack gap="xl" align="center">
            <Title size="2rem" fw={700} c="red" ta="center">
              Payment Error
            </Title>
            <Text size="lg" c="dimmed" ta="center">
              {error}
            </Text>
            <Button onClick={() => router.push(ROUTES.pricing)}>Try Again</Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Paper p="xl" radius="md">
        <Stack gap="xl" align="center">
          <CheckCircle size={64} color={COLORS.success} />

          <Title size="2rem" fw={700} c="white" ta="center">
            Subscription Successful!
          </Title>

          <Text size="lg" c="dimmed" ta="center">
            Welcome to MovieHub {user?.subscriptionPlan || "Premium"}! Your subscription is now
            active.
          </Text>

          <Stack gap="md" w="100%">
            <Button fullWidth size="lg" color="blue" onClick={() => router.push(ROUTES.home)}>
              Start Exploring
            </Button>

            <Button
              fullWidth
              size="lg"
              variant="outline"
              onClick={() => router.push(ROUTES.profile)}
            >
              View Profile
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}
