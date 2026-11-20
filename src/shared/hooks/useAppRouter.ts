"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { startNavigationProgress } from "@/shared/lib/navigation-progress";

/**
 * `useRouter` whose push/replace also show the navigation progress bar. Link clicks are picked up
 * automatically; programmatic navigations have to announce themselves.
 */
export function useAppRouter(): ReturnType<typeof useRouter> {
  const router = useRouter();
  return useMemo(
    () => ({
      ...router,
      push: (href, options) => {
        startNavigationProgress(href);
        router.push(href, options);
      },
      replace: (href, options) => {
        startNavigationProgress(href);
        router.replace(href, options);
      },
    }),
    [router],
  );
}
