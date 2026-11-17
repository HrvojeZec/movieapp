"use client";
import { Container, Paper, Stack, Text, Title } from "@mantine/core";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ProtectedRoute } from "@/features/auth/ui/ProtectedRoute/ProtectedRoute";
import { ProfileHeader } from "@/features/profile/ui/ProfileHeader/ProfileHeader";
import { SubscriptionPanel } from "@/features/profile/ui/SubscriptionPanel/SubscriptionPanel";
import { formatDate } from "@/shared/lib/format";
import CountUp from "@/shared/vendor/react-bits/CountUp/CountUp";
import { Reveal } from "@/shared/ui/motion/Reveal";

export function ProfileView() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Title size="2rem" fw={700} c="white">
          Profile
        </Title>

        <Reveal index={0}>
          <ProfileHeader user={user} />
        </Reveal>
        <Reveal index={1}>
          <SubscriptionPanel user={user} />
        </Reveal>

        <Reveal index={2}>
          <Paper p="xl" radius="md">
            <Title size="lg" mb="md" c="white">
              Activity
            </Title>
            <Stack gap="md">
              <Text c="gray.4">
                Favorited <CountUp to={user.favorites.length} /> movies
              </Text>
              <Text c="gray.4">Member since {formatDate(user.createdAt)}</Text>
            </Stack>
          </Paper>
        </Reveal>
      </Stack>
    </Container>
  );
}
