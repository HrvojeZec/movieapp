import Link from "next/link";
import { Anchor, Avatar, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { Calendar, Heart, Mail } from "lucide-react";
import type { AuthUser } from "@/entities/user/types";
import { formatDate, pluralize } from "@/shared/lib/format";
import { ROUTES } from "@/shared/routes";
import { COLORS } from "@/shared/theme/colors";
import { RollingNumber } from "@/shared/ui/motion/RollingNumber/RollingNumber";

export function ProfileHeader({ user }: { user: AuthUser }) {
  const favoriteCount = user.favorites.length;

  return (
    <Paper p="xl" radius="md">
      <Group gap="xl" align="flex-start">
        <Avatar size="xl" color="blue" radius="md">
          {user.name.charAt(0).toUpperCase()}
        </Avatar>

        <Stack gap="sm">
          <Title order={2} size="xl" c="white">
            {user.name}
          </Title>

          <Group gap="xs">
            <Mail size={16} color={COLORS.muted} />
            <Text c="gray.4">{user.email}</Text>
          </Group>
          <Group gap="xs">
            <Calendar size={16} color={COLORS.muted} />
            <Text c="gray.4">Member since {formatDate(user.createdAt)}</Text>
          </Group>
          <Group gap="xs">
            <Heart size={16} color={COLORS.danger} />
            <Text c="gray.4">
              <RollingNumber value={favoriteCount} /> {pluralize(favoriteCount, "favorite")}
            </Text>
            {favoriteCount > 0 && (
              <Anchor component={Link} href={ROUTES.favorites} size="sm">
                View
              </Anchor>
            )}
          </Group>
        </Stack>
      </Group>
    </Paper>
  );
}
