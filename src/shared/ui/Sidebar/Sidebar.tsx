"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Skeleton } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import { LayoutGroup } from "motion/react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCommandPaletteStore } from "@/features/movies/store/command-palette.store";
import { useEntitlements } from "@/features/subscription/hooks/useEntitlements";
import { useSidebarState } from "@/shared/hooks/useSidebarState";
import { ROUTES } from "@/shared/routes";
import { lockedPlanName, visibleGroups, type SidebarLink } from "./sidebar-links";
import { SidebarAuthCard } from "./SidebarAuthCard";
import { SidebarItem } from "./SidebarItem";
import { SidebarProfileCard } from "./SidebarProfileCard";
import { useSidebarOverlayStore } from "./sidebar-overlay.store";
import { SIDEBAR_TOGGLE_ATTRIBUTE } from "./SidebarToggle";
import { useSidebarWide } from "./useSidebarWide";
import classes from "./Sidebar.module.scss";

const isActive = (link: SidebarLink, pathname: string) =>
  !link.opensSearch &&
  (pathname === link.href || (link.href !== ROUTES.home && pathname.startsWith(`${link.href}/`)));

/**
 * Navigation and the user's library, under the header. On desktop it is wide or a narrow rail
 * (remembered; the inline script in <head> applies it before the first paint). On tablets it
 * stays a rail and opens wide over the page. The toggle and the logo live in the header.
 */
export function Sidebar() {
  const { user, loading } = useAuth();
  const { plan, loading: planLoading } = useEntitlements();
  const pathname = usePathname();
  const openSearch = useCommandPaletteStore((state) => state.open);
  const { wide, overlayOpen } = useSidebarWide();
  const setOverlay = useSidebarOverlayStore((state) => state.setOpened);
  const ref = useRef<HTMLDivElement>(null);
  const closeOverlay = () => setOverlay(false);
  // Here, mounted once (the header toggle uses the same state and would toggle it twice)
  const { toggle } = useSidebarState();
  useHotkeys([["mod+B", toggle]]);

  useEffect(() => {
    if (!overlayOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOverlay(false);
    };
    // The header toggle is outside the panel too; closing on its press would reopen on its click
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Element;
      if (ref.current?.contains(target) || target.closest(`[${SIDEBAR_TOGGLE_ATTRIBUTE}]`)) return;
      setOverlay(false);
    };
    // Capture: the focused toggle's tooltip stops Escape from bubbling
    window.addEventListener("keydown", onKey, true);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [overlayOpen, setOverlay]);

  return (
    <div ref={ref} className={classes.panel} data-overlay={overlayOpen || undefined}>
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
