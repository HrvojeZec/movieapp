"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Divider, Drawer, NavLink, Stack } from "@mantine/core";
import { CreditCard, LogOut, User } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { MovieSearchBox } from "@/features/movies/ui/MovieSearchBox/MovieSearchBox";
import { ROUTES } from "@/shared/routes";
import { visibleGroups } from "@/shared/ui/Sidebar/sidebar-links";
import { AuthButtons } from "./AuthButtons";

interface NavDrawerProps {
  opened: boolean;
  onClose: () => void;
}

/** Navigation, search and the account for phones, where the sidebar is hidden. */
export function NavDrawer({ opened, onClose }: NavDrawerProps) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const logout = useLogout();

  // Any navigation (a link, a search result) closes the drawer
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // The drawer has its own search box, so the sidebar's "Search" entry isn't repeated
  const links = visibleGroups(user)
    .flatMap((group) => group.links)
    .filter((link) => !link.opensSearch);

  return (
    <Drawer opened={opened} onClose={onClose} title="MovieHub" hiddenFrom="sm" size="xs">
      <Stack gap="md">
        <MovieSearchBox placeholder="Search movies..." clearOnSubmit />

        <nav aria-label="Main">
          {links.map(({ label, href, icon: Icon }) => (
            <NavLink
              key={href}
              component={Link}
              href={href}
              label={label}
              leftSection={<Icon size={18} />}
              active={pathname === href}
            />
          ))}
        </nav>

        {!loading && user && (
          <>
            <Divider />
            <div>
              <NavLink
                component={Link}
                href={ROUTES.profile}
                label="Profile"
                leftSection={<User size={18} />}
              />
              <NavLink
                component={Link}
                href={ROUTES.pricing}
                label="Subscription"
                leftSection={<CreditCard size={18} />}
              />
              <NavLink
                component="button"
                label="Logout"
                leftSection={<LogOut size={18} />}
                onClick={() => {
                  onClose();
                  logout.mutate();
                }}
              />
            </div>
          </>
        )}
        {!loading && !user && (
          <>
            <Divider />
            <AuthButtons fullWidth />
          </>
        )}
      </Stack>
    </Drawer>
  );
}
