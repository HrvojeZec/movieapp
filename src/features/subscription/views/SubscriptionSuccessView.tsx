"use client";
import { Container, Title, Text, Button, Stack, Paper, Loader, Center } from "@mantine/core";
import { CheckCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authKeys, useAuth } from "@/features/auth/queries";
import { fetchJson } from "@/shared/lib/http";

export function SubscriptionSuccessView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const confirmation = useMutation({
    mutationFn: (id: string) =>
      fetchJson<unknown>("/api/stripe/checkout-success", {
        method: "POST",
        body: JSON.stringify({ sessionId: id }),
      }),
    // Refetch the session so the navbar and profile show the new plan right away
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authKeys.me }),
  });
  const { mutate: confirm } = confirmation;

  // The user object changes when the session is refetched; confirm each checkout only once
  const confirmedSessionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!sessionId || !user || confirmedSessionRef.current === sessionId) return;
    confirmedSessionRef.current = sessionId;
    confirm(sessionId);
  }, [sessionId, user, confirm]);

  const error = !sessionId
    ? "No session ID found"
    : !authLoading && !user
      ? "Log in to finish activating your subscription"
      : confirmation.isError
        ? "Failed to process payment"
        : null;
  const loading = !error && !confirmation.isSuccess;

  if (loading) {
    return (
      <Container size="sm" py="xl">
        <Center h={400}>
          <div style={{ textAlign: "center" }}>
            <Loader size="lg" mb="md" />
            <Text c="white">Processing your payment...</Text>
          </div>
        </Center>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="sm" py="xl">
        <Paper
          p="xl"
          bg="dark.7"
          radius="md"
          style={{ border: "1px solid rgba(255, 255, 255, 0.1)" }}
        >
          <Stack gap="xl" align="center">
            <Title size="2rem" fw={700} c="red" ta="center">
              Payment Error
            </Title>
            <Text size="lg" c="dimmed" ta="center">
              {error}
            </Text>
            <Button onClick={() => router.push("/subscription/pricing")}>Try Again</Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Paper
        p="xl"
        bg="dark.7"
        radius="md"
        style={{ border: "1px solid rgba(255, 255, 255, 0.1)" }}
      >
        <Stack gap="xl" align="center">
          <CheckCircle size={64} color="#10b981" />

          <Title size="2rem" fw={700} c="white" ta="center">
            Subscription Successful!
          </Title>

          <Text size="lg" c="dimmed" ta="center">
            Welcome to MovieHub {user?.subscriptionPlan || "Premium"}! Your subscription is now
            active.
          </Text>

          <Stack gap="md" w="100%">
            <Button fullWidth size="lg" color="blue" onClick={() => router.push("/")}>
              Start Exploring
            </Button>

            <Button fullWidth size="lg" variant="outline" onClick={() => router.push("/profile")}>
              View Profile
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}
