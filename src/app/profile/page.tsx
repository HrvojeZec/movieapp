"use client";
import {
  Container,
  Title,
  Paper,
  Text,
  Group,
  Avatar,
  Badge,
  Stack,
  Button,
} from "@mantine/core";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/Auth/ProtectedRoute";
import { Calendar, Heart, Mail, CreditCard, Crown } from "lucide-react";
import { formatDateDisplay } from "@/utils";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const getSubscriptionColor = (plan?: string) => {
    switch (plan) {
      case "pro":
        return "orange";
      case "premium":
        return "blue";
      default:
        return "gray";
    }
  };

  const getSubscriptionIcon = (plan?: string) => {
    return plan === "pro" || plan === "premium" ? <Crown size={14} /> : null;
  };
  console.log(user);

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Title size="2rem" fw={700} c="white" data-aos="fade-down">
          Profile
        </Title>

        <Paper
          data-aos="fade-up"
          data-aos-delay="200"
          p="xl"
          bg="dark.7"
          radius="md"
          style={{ border: "1px solid rgba(255, 255, 255, 0.1)" }}
        >
          <Group gap="xl">
            <Avatar size="xl" color="blue" radius="md">
              {user.name.charAt(0).toUpperCase()}
            </Avatar>

            <Stack gap="md">
              <Title size="xl" c="white">
                {user.name}
              </Title>

              <Group gap="md">
                <Group gap="xs">
                  <Mail size={16} color="#9ca3af" />
                  <Text c="gray.4">{user.email}</Text>
                </Group>
                <Group gap="xs">
                  <Calendar size={16} color="#9ca3af" />
                  <Text c="gray.4">
                    Member since {formatDateDisplay.long(user.createdAt)}
                  </Text>
                </Group>
              </Group>

              <Group gap="xs">
                <Heart size={16} color="#ef4444" />
                <Badge variant="light" color="red">
                  {user.favorites?.length || 0} Favorites
                </Badge>
              </Group>
            </Stack>
          </Group>
        </Paper>

        <Paper
          data-aos="fade-up"
          data-aos-delay="300"
          p="xl"
          bg="dark.7"
          radius="md"
          style={{ border: "1px solid rgba(255, 255, 255, 0.1)" }}
        >
          <Group justify="space-between" mb="md">
            <Group gap="sm">
              <CreditCard size={24} color="#3b82f6" />
              <Title size="lg" c="white">
                Subscription
              </Title>
            </Group>
          </Group>

          <Stack gap="md">
            <Group gap="md">
              <Badge
                variant="filled"
                color={getSubscriptionColor(user.subscriptionPlan)}
                size="lg"
                leftSection={getSubscriptionIcon(user.subscriptionPlan)}
              >
                {user.subscriptionPlan?.toUpperCase() || "BASIC"} PLAN
              </Badge>
              <Badge
                variant="outline"
                color={user.subscriptionStatus === "active" ? "green" : "gray"}
              >
                {user.subscriptionStatus === "active" ? "Active" : "Inactive"}
              </Badge>
            </Group>

            <Text c="gray.3" size="sm">
              {user.subscriptionPlan === "premium"
                ? "🎬 Premium features: Advanced filters, HD trailers, unlimited watchlist, priority support"
                : user.subscriptionPlan === "pro"
                ? "🚀 Pro features: Everything in Premium + movie recommendations, analytics, API access"
                : "📱 Basic features: Browse movies, add favorites, basic search"}
            </Text>

            {user.subscriptionStatus !== "active" &&
              user.subscriptionPlan === "basic" && (
                <Group gap="sm" mt="sm">
                  <Button
                    size="sm"
                    color="blue"
                    onClick={() => router.push("/subscription/pricing")}
                  >
                    Upgrade to Premium
                  </Button>
                </Group>
              )}
          </Stack>
        </Paper>
        <Paper
          data-aos="fade-up"
          data-aos-delay="400"
          p="xl"
          bg="dark.7"
          radius="md"
          style={{ border: "1px solid rgba(255, 255, 255, 0.1)" }}
        >
          <Title size="lg" mb="md" c="white">
            Activity
          </Title>

          <Stack gap="md">
            <Text c="gray.4">
              Favorited {user.favorites?.length || 0} movies
            </Text>
            <Text c="gray.4">
              Member since {formatDateDisplay.long(user.createdAt)}
            </Text>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
