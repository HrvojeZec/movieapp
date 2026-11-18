"use client";
import Link from "next/link";
import { ActionIcon, Avatar, Menu } from "@mantine/core";
import { Bookmark, CreditCard, Eye, ListVideo, LogOut, Sparkles, User } from "lucide-react";
import { useLogout } from "@/features/auth/hooks/useLogout";
import type { AuthUser } from "@/features/auth/types";
import { ROUTES } from "@/shared/routes";

const MENU_WIDTH = 200;

export function UserMenu({ user }: { user: AuthUser }) {
  const logout = useLogout();

  return (
    <Menu shadow="md" width={MENU_WIDTH}>
      <Menu.Target>
        <ActionIcon variant="subtle" size="lg" aria-label="Account menu">
          <Avatar size="sm" color="blue">
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Signed in as {user.email}</Menu.Label>
        <Menu.Item leftSection={<User size={16} />} component={Link} href={ROUTES.profile}>
          Profile
        </Menu.Item>
        <Menu.Item leftSection={<Bookmark size={16} />} component={Link} href={ROUTES.watchlist}>
          Watchlist
        </Menu.Item>
        <Menu.Item leftSection={<Eye size={16} />} component={Link} href={ROUTES.watched}>
          Watched
        </Menu.Item>
        <Menu.Item leftSection={<ListVideo size={16} />} component={Link} href={ROUTES.lists}>
          Lists
        </Menu.Item>
        <Menu.Item
          leftSection={<Sparkles size={16} />}
          component={Link}
          href={ROUTES.recommendations}
        >
          For you
        </Menu.Item>
        <Menu.Item leftSection={<CreditCard size={16} />} component={Link} href={ROUTES.pricing}>
          Subscription
        </Menu.Item>
        <Menu.Item leftSection={<LogOut size={16} />} onClick={() => logout.mutate()}>
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
