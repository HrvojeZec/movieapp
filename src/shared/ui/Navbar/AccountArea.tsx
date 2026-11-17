"use client";
import { Box, Group, Skeleton } from "@mantine/core";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { AuthButtons } from "./AuthButtons";
import { FavoritesMenu } from "./FavoritesMenu";
import { UserMenu } from "./UserMenu";

// Roughly the size of what replaces it: two icons on phones, two buttons on wider screens
const PLACEHOLDER = { height: 36, width: { base: 72, sm: 160 } };

/** Right side of the navbar: a placeholder while the session loads, then menus or auth buttons. */
export function AccountArea() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Skeleton
        h={PLACEHOLDER.height}
        w={PLACEHOLDER.width}
        radius="sm"
        aria-label="Loading account"
      />
    );
  }

  if (!user) {
    // On phones the buttons live in the drawer, so the header fits on one line
    return (
      <Box visibleFrom="sm">
        <AuthButtons />
      </Box>
    );
  }

  return (
    <Group gap="sm">
      <FavoritesMenu favorites={user.favorites} />
      <UserMenu user={user} />
    </Group>
  );
}
