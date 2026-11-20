export const NAVIGATION_START_EVENT = "movieapp:navigation-start";

/**
 * True when going to `targetHref` loads another page: same origin, and a different path or query.
 * A hash-only change scrolls the current page, so it never shows progress.
 */
export function isNewDestination(targetHref: string, currentHref: string): boolean {
  let target: URL;
  let current: URL;
  try {
    current = new URL(currentHref);
    target = new URL(targetHref, current);
  } catch {
    return false;
  }
  if (target.origin !== current.origin) return false;
  return target.pathname !== current.pathname || target.search !== current.search;
}

/** Shows the navigation progress bar for navigations that don't start from a link click. */
export function startNavigationProgress(href: string): void {
  window.dispatchEvent(new CustomEvent(NAVIGATION_START_EVENT, { detail: href }));
}
