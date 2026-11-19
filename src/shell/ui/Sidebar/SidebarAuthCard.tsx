"use client";
import { ActionIcon, Text, Tooltip } from "@mantine/core";
import { LogIn } from "lucide-react";
import { useAppRouter } from "@/shared/hooks/useAppRouter";
import { ROUTES } from "@/shared/routes";
import { AuthButtons } from "@/shell/ui/Navbar/AuthButtons";
import classes from "./Sidebar.module.scss";

/** For visitors: a short pitch with Login and Sign Up, or a login icon when the sidebar is narrow. */
export function SidebarAuthCard() {
  const router = useAppRouter();

  return (
    <div className={classes.authCard}>
      <div className={classes.wideOnly}>
        <Text size="sm" c="white" fw={600}>
          Sign in to save movies
        </Text>
        <Text size="xs" c="dimmed" mb="sm">
          Favorites, a watchlist and your own lists, on every device.
        </Text>
        <AuthButtons fullWidth />
      </div>
      <Tooltip label="Login" position="right" withArrow>
        <ActionIcon
          variant="light"
          size="lg"
          className={classes.railOnly}
          aria-label="Login"
          onClick={() => router.push(ROUTES.login)}
        >
          <LogIn size={18} />
        </ActionIcon>
      </Tooltip>
    </div>
  );
}
