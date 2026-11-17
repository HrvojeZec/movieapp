import { Avatar, Badge, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { Calendar, Heart, Mail } from "lucide-react";
import type { AuthUser } from "@/features/auth/types";
import { formatDate } from "@/shared/lib/format";
import { COLORS } from "@/shared/theme/colors";

export function ProfileHeader({ user }: { user: AuthUser }) {
  return (
    <Paper data-aos="fade-up" data-aos-delay="200" p="xl" radius="md">
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
              <Mail size={16} color={COLORS.muted} />
              <Text c="gray.4">{user.email}</Text>
            </Group>
            <Group gap="xs">
              <Calendar size={16} color={COLORS.muted} />
              <Text c="gray.4">Member since {formatDate(user.createdAt)}</Text>
            </Group>
          </Group>

          <Group gap="xs">
            <Heart size={16} color={COLORS.danger} />
            <Badge variant="light" color="red">
              {user.favorites.length} Favorites
            </Badge>
          </Group>
        </Stack>
      </Group>
    </Paper>
  );
}
