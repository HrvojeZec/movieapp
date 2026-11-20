"use client";
import Link from "next/link";
import { Avatar, Menu, Text, UnstyledButton } from "@mantine/core";
import { ChevronRight, CreditCard, LogOut, User } from "lucide-react";
import { useLogout } from "@/features/auth/hooks/useLogout";
import type { AuthUser } from "@/entities/user/types";
import { getEffectivePlan, getPlanName } from "@/entities/subscription/lib/entitlements";
import { ROUTES } from "@/shared/routes";
import classes from "./Sidebar.module.scss";

const MENU_WIDTH = 220;

/** The signed-in user at the bottom of the sidebar; opens profile, subscription and logout. */
export function SidebarProfileCard({ user }: { user: AuthUser }) {
  const logout = useLogout();
  const planName = getPlanName(getEffectivePlan(user));

  return (
    <Menu position="right-end" width={MENU_WIDTH} shadow="md" withinPortal>
      <Menu.Target>
        <UnstyledButton className={classes.profile} aria-label="Account menu">
          <Avatar size={32} color="blue" radius="xl">
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
          <span className={`${classes.label} ${classes.profileText}`}>
            <Text size="sm" c="white" fw={600} truncate>
              {user.name}
            </Text>
            <Text size="xs" c="dimmed" truncate>
              {planName} plan
            </Text>
          </span>
          <ChevronRight size={16} className={`${classes.label} ${classes.chevron}`} />
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Signed in as {user.email}</Menu.Label>
        <Menu.Item leftSection={<User size={16} />} component={Link} href={ROUTES.profile}>
          Profile
        </Menu.Item>
        <Menu.Item leftSection={<CreditCard size={16} />} component={Link} href={ROUTES.pricing}>
          Subscription
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item leftSection={<LogOut size={16} />} onClick={() => logout.mutate()}>
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
