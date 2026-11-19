"use client";
import { Container, Stack, Title } from "@mantine/core";
import { useAuth } from "@/entities/user/hooks/useAuth";
import { ProtectedRoute } from "@/entities/user/ui/ProtectedRoute/ProtectedRoute";
import { ProfileHeader } from "@/entities/user/ui/ProfileHeader/ProfileHeader";
import { SubscriptionPanel } from "@/features/manage-subscription/ui/SubscriptionPanel/SubscriptionPanel";
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
