"use client";
import type { MouseEvent } from "react";
import { ActionIcon, Button, Tooltip } from "@mantine/core";
import { Bookmark, BookmarkCheck, Lock } from "lucide-react";
import { useAnimate, useReducedMotion } from "motion/react";
import { useWatchlist } from "@/features/toggle-watchlist/hooks/useWatchlist";
import {
  BOOKMARK_DROP_PX,
  BOOKMARK_SWING_DEGREES,
  BOOKMARK_SWING_SECONDS,
  SPRINGS,
} from "@/shared/ui/motion/motion.constants";
import classes from "./WatchlistButton.module.scss";

interface WatchlistButtonProps {
  movieId: number | string;
  /** "overlay": small round button on a card's poster; "inline": labelled, on the movie page. */
  variant?: "overlay" | "inline";
}

/**
 * Saves a movie for later. On cards it only appears for plans that include the watchlist; on the
 * movie page a free account sees it locked, leading to pricing.
 */
export function WatchlistButton({ movieId, variant = "overlay" }: WatchlistButtonProps) {
  const { inWatchlist, isLoggedIn, canUse, disabled, toggle } = useWatchlist(movieId);
  const [icon, animate] = useAnimate<HTMLSpanElement>();
  const reduceMotion = useReducedMotion();

  if (!isLoggedIn) return null;
  if (variant === "overlay" && !canUse) return null;

  const handleClick = (event: MouseEvent) => {
    // The overlay button sits inside a clickable card that opens the movie
    event.stopPropagation();
    // Only saving is celebrated; taking a movie off is quiet
    if (canUse && !inWatchlist && !reduceMotion && icon.current) {
      animate(icon.current, { y: [-BOOKMARK_DROP_PX, 0] }, SPRINGS.bouncy);
      animate(
        icon.current,
        { rotate: BOOKMARK_SWING_DEGREES },
        { duration: BOOKMARK_SWING_SECONDS, ease: "easeOut" },
      );
    }
    toggle();
  };
  const Icon = inWatchlist ? BookmarkCheck : Bookmark;
  const bookmark = (
    <span ref={icon} className={classes.icon}>
      <Icon size={16} />
    </span>
  );

  if (variant === "overlay") {
    return (
      <ActionIcon
        size="md"
        radius="xl"
        variant="filled"
        color={inWatchlist ? "teal" : "dark"}
        onClick={handleClick}
        disabled={disabled}
        aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
        aria-pressed={inWatchlist}
        className={classes.overlay}
      >
        {bookmark}
      </ActionIcon>
    );
  }

  if (!canUse) {
    return (
      <Tooltip label="The watchlist comes with Premium">
        <Button
          variant="default"
          leftSection={<Lock size={16} />}
          onClick={handleClick}
          disabled={disabled}
        >
          Watchlist
        </Button>
      </Tooltip>
    );
  }

  return (
    <Button
      variant={inWatchlist ? "light" : "default"}
      color={inWatchlist ? "teal" : undefined}
      leftSection={bookmark}
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={inWatchlist}
    >
      {inWatchlist ? "On your watchlist" : "Add to watchlist"}
    </Button>
  );
}
