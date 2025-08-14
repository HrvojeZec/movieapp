"use client";
import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Paper,
  Loader,
  Center,
} from "@mantine/core";
import { CheckCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (sessionId && user) {
      handleSuccessfulPayment(sessionId);
    } else if (!sessionId) {
      setError("No session ID found");
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [searchParams, user]);

  const handleSuccessfulPayment = async (sessionId: string) => {
    try {
      const response = await fetch("/api/stripe/checkout-success", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        await refreshUser();
      } else {
        setError("Failed to process payment");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

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
            <Button onClick={() => router.push("/subscription/pricing")}>
              Try Again
            </Button>
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
            Welcome to MovieHub {user?.subscriptionPlan || "Premium"}! Your
            subscription is now active.
          </Text>

          <Stack gap="md" w="100%">
            <Button
              fullWidth
              size="lg"
              color="blue"
              onClick={() => router.push("/")}
            >
              Start Exploring
            </Button>

            <Button
              fullWidth
              size="lg"
              variant="outline"
              onClick={() => router.push("/profile")}
            >
              View Profile
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}
