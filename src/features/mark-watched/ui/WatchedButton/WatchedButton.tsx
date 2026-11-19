"use client";
import { useState, type MouseEvent } from "react";
import { ActionIcon, Button } from "@mantine/core";
import { Check, Eye, EyeOff } from "lucide-react";
import { motion, useAnimate, useReducedMotion } from "motion/react";
import { useWatched } from "@/features/mark-watched/hooks/useWatched";
import {
  BLINK_SCALE,
  BLINK_SECONDS,
  POP_FROM_SCALE,
  SPRINGS,
} from "@/shared/ui/motion/motion.constants";
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
  const [eye, animate] = useAnimate<HTMLSpanElement>();
  const reduceMotion = useReducedMotion();
  // The check pops in only after a click, not for movies already watched when the page loads
  const [marked, setMarked] = useState(false);

  if (!isLoggedIn) return null;

  const handleClick = (event: MouseEvent) => {
    // The overlay button sits inside a clickable card that opens the movie
    event.stopPropagation();
    if (!isWatched) {
      setMarked(true);
      if (!reduceMotion && eye.current) {
        animate(eye.current, { scaleY: BLINK_SCALE }, { duration: BLINK_SECONDS });
      }
    }
    toggle();
  };

  const eyeIcon = (
    <span ref={eye} className={classes.eye}>
      {isWatched || variant === "overlay" ? <Eye size={16} /> : <EyeOff size={16} />}
      {isWatched && (
        <motion.span
          className={classes.check}
          initial={marked ? { scale: POP_FROM_SCALE, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={SPRINGS.bouncy}
        >
          <Check size={8} strokeWidth={4} />
        </motion.span>
      )}
    </span>
  );

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
        {eyeIcon}
      </ActionIcon>
    );
  }

  return (
    <Button
      variant={isWatched ? "light" : "default"}
      leftSection={eyeIcon}
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={isWatched}
      title={isWatched ? "Click to mark as not watched" : undefined}
    >
      {isWatched ? "Watched" : "Mark as watched"}
    </Button>
  );
}
