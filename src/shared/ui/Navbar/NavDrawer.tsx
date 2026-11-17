"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Divider, Drawer, NavLink, Stack } from "@mantine/core";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { MovieSearchBox } from "@/features/movies/ui/MovieSearchBox/MovieSearchBox";
import { AuthButtons } from "./AuthButtons";
import { DRAWER_LINKS } from "./nav-links";

interface NavDrawerProps {
  opened: boolean;
  onClose: () => void;
}

/** Navigation, search and login for phones and tablets. */
export function NavDrawer({ opened, onClose }: NavDrawerProps) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // Any navigation (a link, a search result) closes the drawer
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  const links = DRAWER_LINKS.filter((link) => !link.requiresAuth || user);

  return (
    <Drawer opened={opened} onClose={onClose} title="MovieHub" hiddenFrom="md" size="xs">
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
