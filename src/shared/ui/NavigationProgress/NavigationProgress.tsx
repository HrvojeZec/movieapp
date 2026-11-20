"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { isNewDestination, NAVIGATION_START_EVENT } from "@/shared/lib/navigation-progress";
import classes from "./NavigationProgress.module.scss";

// Fast navigations finish before the bar appears, so it doesn't flicker on every click
const SHOW_DELAY_MS = 150;
// Matches the fade-out in the stylesheet
const FINISH_MS = 450;
// If the URL never changes (navigation cancelled or failed), don't leave the bar hanging
const GIVE_UP_MS = 15_000;

type Phase = "idle" | "loading" | "done";

function isPlainLeftClick(event: MouseEvent): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

/**
 * A thin bar at the top of the page while a navigation is in flight, so a slow server render
 * (home page, movie page) doesn't look like the app froze. It finishes when the URL changes.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<Phase>("idle");
  const pending = useRef(false);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  const finish = useCallback(() => {
    if (!pending.current) return;
    pending.current = false;
    clearTimers();
    setPhase((current) => (current === "loading" ? "done" : "idle"));
  }, []);

  const start = useCallback(
    (href: string) => {
      if (!isNewDestination(href, window.location.href)) return;
      pending.current = true;
      clearTimers();
      timers.current.push(
        window.setTimeout(() => setPhase("loading"), SHOW_DELAY_MS),
        window.setTimeout(finish, GIVE_UP_MS),
      );
    },
    [finish],
  );

  useEffect(() => {
    // Capture phase: some handlers inside links stop propagation
    const onClick = (event: MouseEvent) => {
      if (!isPlainLeftClick(event)) return;
      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if ((anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;
      start(anchor.href);
    };
    const onStart = (event: Event) => start((event as CustomEvent<string>).detail);

    document.addEventListener("click", onClick, true);
    window.addEventListener(NAVIGATION_START_EVENT, onStart);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener(NAVIGATION_START_EVENT, onStart);
      clearTimers();
    };
  }, [start]);

  useEffect(finish, [pathname, searchParams, finish]);

  useEffect(() => {
    if (phase !== "done") return;
    const id = window.setTimeout(() => setPhase("idle"), FINISH_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  return (
    <div
      className={classes.bar}
      data-phase={phase}
      role="progressbar"
      aria-label="Loading page"
      aria-hidden={phase !== "loading"}
    />
  );
}
