"use client";
import { useRouter } from "next/navigation";
import { Button, Group, Skeleton } from "@mantine/core";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ROUTES } from "@/shared/routes";
import { FavoritesMenu } from "./FavoritesMenu";
import { UserMenu } from "./UserMenu";

const PLACEHOLDER = { width: 160, height: 36 };

/** Right side of the navbar: a placeholder while the session loads, then menus or auth buttons. */
export function AccountArea() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <Skeleton
        height={PLACEHOLDER.height}
        width={PLACEHOLDER.width}
        radius="sm"
        aria-label="Loading account"
      />
    );
  }

  if (!user) {
    return (
      <Group gap="sm">
        <Button variant="subtle" onClick={() => router.push(ROUTES.login)}>
          Login
        </Button>
        <Button onClick={() => router.push(ROUTES.register)}>Sign Up</Button>
      </Group>
    );
  }

  return (
    <Group gap="sm">
      <FavoritesMenu favorites={user.favorites} />
      <UserMenu user={user} />
    </Group>
  );
}
