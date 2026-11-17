"use client";
import { useEffect, useRef, type ComponentProps } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Long enough to skip cards the pointer only sweeps across, short enough to finish before a click
const HOVER_INTENT_MS = 80;

type IntentPrefetchLinkProps = Omit<ComponentProps<typeof Link>, "href" | "prefetch"> & {
  href: string;
};

/**
 * A Link that prefetches when the user shows intent (hover, focus, touch) instead of when it
 * scrolls into view. Next prefetches every visible link by default, which on a grid of movie cards
 * is dozens of server renders per page; `prefetch={false}` alone would also turn off the hover
 * prefetch, so it's done here by hand.
 */
export function IntentPrefetchLink({
  href,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onTouchStart,
  ...props
}: IntentPrefetchLinkProps) {
  const router = useRouter();
  const timer = useRef<number | undefined>(undefined);

  const cancel = () => window.clearTimeout(timer.current);
  const prefetch = () => {
    cancel();
    router.prefetch(href);
  };

  useEffect(() => cancel, []);

  return (
    <Link
      href={href}
      prefetch={false}
      onMouseEnter={(event) => {
        onMouseEnter?.(event);
        cancel();
        timer.current = window.setTimeout(prefetch, HOVER_INTENT_MS);
      }}
      onMouseLeave={(event) => {
        onMouseLeave?.(event);
        cancel();
      }}
      onFocus={(event) => {
        onFocus?.(event);
        prefetch();
      }}
      onTouchStart={(event) => {
        onTouchStart?.(event);
        prefetch();
      }}
      {...props}
    />
  );
}
