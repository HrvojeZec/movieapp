"use client";
import { Container, Stack, Title } from "@mantine/core";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ProtectedRoute } from "@/features/auth/ui/ProtectedRoute/ProtectedRoute";
import { ProfileHeader } from "@/features/profile/ui/ProfileHeader/ProfileHeader";
import { SubscriptionPanel } from "@/features/profile/ui/SubscriptionPanel/SubscriptionPanel";
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
        <Title order={1} size="2rem" fw={700} c="white">
          Profile
        </Title>

        <Reveal index={0}>
          <ProfileHeader user={user} />
        </Reveal>
        <Reveal index={1}>
          <SubscriptionPanel user={user} />
        </Reveal>
      </Stack>
    </Container>
  );
}
