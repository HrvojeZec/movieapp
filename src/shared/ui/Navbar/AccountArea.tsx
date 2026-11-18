"use client";
import { Skeleton } from "@mantine/core";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { NotificationsMenu } from "./NotificationsMenu";

const PLACEHOLDER_SIZE = 36;

/** Right side of the header: the bell for signed-in users. The account itself is in the sidebar. */
export function AccountArea() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Skeleton
        h={PLACEHOLDER_SIZE}
        w={PLACEHOLDER_SIZE}
        radius="sm"
        aria-label="Loading account"
      />
    );
  }
  return user ? <NotificationsMenu /> : null;
}
