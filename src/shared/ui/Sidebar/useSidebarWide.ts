"use client";
import { useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useSidebarState } from "@/shared/hooks/useSidebarState";
import { useSidebarOverlayStore } from "./sidebar-overlay.store";

/**
 * Whether the sidebar is wide right now, and how to change it: on desktop the saved
 * collapsed/expanded choice, on tablets the panel opened over the page.
 */
export function useSidebarWide() {
  const theme = useMantineTheme();
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.lg})`);
  const { collapsed, toggle } = useSidebarState();
  const overlay = useSidebarOverlayStore((state) => state.opened);
  const toggleOverlay = useSidebarOverlayStore((state) => state.toggle);

  // Only tablets open over the page; on desktop the toggle changes the layout instead
  const overlayOpen = overlay && !isDesktop;
  return {
    wide: isDesktop ? !collapsed : overlayOpen,
    overlayOpen,
    toggle: isDesktop ? toggle : toggleOverlay,
  };
}
