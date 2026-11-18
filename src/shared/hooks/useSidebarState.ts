"use client";
import { useCallback, useSyncExternalStore } from "react";
import { useHotkeys } from "@mantine/hooks";
import { SIDEBAR_STORAGE_KEY, type SidebarMode } from "@/shared/lib/sidebar-script";

const readMode = (): SidebarMode =>
  document.documentElement.dataset.sidebar === "collapsed" ? "collapsed" : "expanded";

// The inline script and toggle() write data-sidebar on <html>; this follows it
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-sidebar"],
  });
  return () => observer.disconnect();
}

/** The desktop sidebar's wide or collapsed state, remembered in localStorage; Ctrl/⌘+B toggles it. */
export function useSidebarState() {
  const mode = useSyncExternalStore(subscribe, readMode, () => "expanded" as const);

  const toggle = useCallback(() => {
    const next: SidebarMode = readMode() === "collapsed" ? "expanded" : "collapsed";
    document.documentElement.dataset.sidebar = next;
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, next);
    } catch {
      // Blocked storage: the choice lasts until the page reloads
    }
  }, []);

  useHotkeys([["mod+B", toggle]]);

  return { collapsed: mode === "collapsed", toggle };
}
