"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ActionIcon, Skeleton, Text, Tooltip, useMantineTheme } from "@mantine/core";
import { useClickOutside, useMediaQuery } from "@mantine/hooks";
import { Film, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { LayoutGroup } from "motion/react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCommandPaletteStore } from "@/features/movies/store/command-palette.store";
import { useEntitlements } from "@/features/subscription/hooks/useEntitlements";
import { useSidebarState } from "@/shared/hooks/useSidebarState";
import { APP_NAME } from "@/shared/constants";
import { ROUTES } from "@/shared/routes";
import { COLORS } from "@/shared/theme/colors";
import { lockedPlanName, visibleGroups, type SidebarLink } from "./sidebar-links";
import { SidebarAuthCard } from "./SidebarAuthCard";
import { SidebarItem } from "./SidebarItem";
import { SidebarProfileCard } from "./SidebarProfileCard";
import classes from "./Sidebar.module.scss";

const isActive = (link: SidebarLink, pathname: string) =>
  !link.opensSearch &&
  (pathname === link.href || (link.href !== ROUTES.home && pathname.startsWith(`${link.href}/`)));

/**
 * Navigation and the user's library. On desktop it is wide or a narrow rail (remembered; the
 * inline script in <head> applies it before the first paint). On tablets it stays a rail and
 * opens wide over the page.
 */
export function Sidebar() {
  const { user, loading } = useAuth();
  const { plan, loading: planLoading } = useEntitlements();
  const pathname = usePathname();
  const openSearch = useCommandPaletteStore((state) => state.open);
  const { collapsed, toggle } = useSidebarState();
  const theme = useMantineTheme();
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.lg})`);
  const [overlay, setOverlay] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOverlay(false));

  // Only tablets open over the page; on desktop the toggle changes the layout instead
  const overlayOpen = overlay && !isDesktop;
  const wide = isDesktop ? !collapsed : overlayOpen;
  const closeOverlay = () => setOverlay(false);

  useEffect(() => {
    if (!overlayOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOverlay(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [overlayOpen]);

  const ToggleIcon = wide ? PanelLeftClose : PanelLeftOpen;

  return (
    <div ref={ref} className={classes.panel} data-overlay={overlayOpen || undefined}>
      {/* Wide: the toggle sits right of the logo. Narrow: it takes the logo's place on hover */}
      <div className={classes.top}>
        <Link href={ROUTES.home} className={classes.brand} onClick={closeOverlay}>
          <span className={classes.icon}>
            <Film size={26} color={COLORS.primary} />
          </span>
          <Text component="span" size="lg" fw={700} c="white" className={classes.label}>
            {APP_NAME}
          </Text>
        </Link>
        <Tooltip label={wide ? "Collapse sidebar" : "Expand sidebar"} position="right" withArrow>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            className={classes.toggle}
            onClick={isDesktop ? toggle : () => setOverlay((open) => !open)}
            aria-expanded={wide}
            aria-label={wide ? "Collapse sidebar" : "Expand sidebar"}
          >
            <ToggleIcon size={18} />
          </ActionIcon>
        </Tooltip>
      </div>

      <div className={classes.groups}>
        <LayoutGroup id="sidebar">
          {visibleGroups(user).map((group) => (
            <div key={group.label} className={classes.group}>
              <div className={classes.groupLabel}>
                <span className={classes.label}>{group.label}</span>
              </div>
              {group.links.map((link) => (
                <SidebarItem
                  key={link.label}
                  link={link}
                  active={isActive(link, pathname)}
                  lockedPlan={planLoading ? null : lockedPlanName(link, plan)}
                  count={link.badge === "favorites" ? user?.favorites.length : undefined}
                  wide={wide}
                  onNavigate={closeOverlay}
                  onOpenSearch={() => {
                    closeOverlay();
                    openSearch();
                  }}
                />
              ))}
            </div>
          ))}
        </LayoutGroup>
      </div>

      <div className={classes.footer}>
        {loading ? (
          <Skeleton height={44} radius="md" />
        ) : user ? (
          <SidebarProfileCard user={user} />
        ) : (
          <SidebarAuthCard />
        )}
      </div>
    </div>
  );
}
