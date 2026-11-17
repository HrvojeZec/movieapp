"use client";
import { useAppRouter } from "@/shared/hooks/useAppRouter";
import { Button, Group } from "@mantine/core";
import { ROUTES } from "@/shared/routes";

/** Login and Sign Up, in the header on wide screens and in the drawer on phones. */
export function AuthButtons({ fullWidth = false }: { fullWidth?: boolean }) {
  const router = useAppRouter();

  return (
    <Group gap="sm" grow={fullWidth}>
      <Button variant="subtle" onClick={() => router.push(ROUTES.login)}>
        Login
      </Button>
      <Button onClick={() => router.push(ROUTES.register)}>Sign Up</Button>
    </Group>
  );
}
