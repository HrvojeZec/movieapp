"use client";
import type { MouseEvent } from "react";
import { ActionIcon, Button } from "@mantine/core";
import { Eye, EyeOff } from "lucide-react";
import { useWatched } from "@/features/watched/hooks/useWatched";
import classes from "./WatchedButton.module.scss";

interface WatchedButtonProps {
  movieId: number | string;
  /** "overlay": small round button on a card's poster; "inline": labelled, on the movie page. */
  variant?: "overlay" | "inline";
}

/**
 * Marks a movie as watched, on every plan. Hidden for logged-out visitors, like the heart on the
 * movie page: it would only lead to the login page.
 */
export function WatchedButton({ movieId, variant = "overlay" }: WatchedButtonProps) {
  const { isWatched, isLoggedIn, disabled, toggle } = useWatched(movieId);

  if (!isLoggedIn) return null;

  const handleClick = (event: MouseEvent) => {
    // The overlay button sits inside a clickable card that opens the movie
    event.stopPropagation();
    toggle();
  };

  if (variant === "overlay") {
    return (
      <ActionIcon
        size="md"
        radius="xl"
        variant="filled"
        color="dark"
        onClick={handleClick}
        disabled={disabled}
        aria-label={isWatched ? "Mark as not watched" : "Mark as watched"}
        aria-pressed={isWatched}
        className={classes.overlay}
      >
        <Eye size={16} />
      </ActionIcon>
    );
  }

  return (
    <Button
      variant={isWatched ? "light" : "default"}
      leftSection={isWatched ? <Eye size={16} /> : <EyeOff size={16} />}
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={isWatched}
      title={isWatched ? "Click to mark as not watched" : undefined}
    >
      {isWatched ? "Watched" : "Mark as watched"}
    </Button>
  );
}
