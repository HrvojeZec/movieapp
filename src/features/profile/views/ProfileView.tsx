"use client";
import { Container, Paper, Stack, Text, Title } from "@mantine/core";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ProtectedRoute } from "@/features/auth/ui/ProtectedRoute/ProtectedRoute";
import { ProfileHeader } from "@/features/profile/ui/ProfileHeader/ProfileHeader";
import { SubscriptionPanel } from "@/features/profile/ui/SubscriptionPanel/SubscriptionPanel";
import { formatDate } from "@/shared/lib/format";

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
        <Title size="2rem" fw={700} c="white" data-aos="fade-down">
          Profile
        </Title>

        <ProfileHeader user={user} />
        <SubscriptionPanel user={user} />

        <Paper data-aos="fade-up" data-aos-delay="400" p="xl" radius="md">
          <Title size="lg" mb="md" c="white">
            Activity
          </Title>
          <Stack gap="md">
            <Text c="gray.4">Favorited {user.favorites.length} movies</Text>
            <Text c="gray.4">Member since {formatDate(user.createdAt)}</Text>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
