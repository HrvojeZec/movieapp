"use client";
import type { MouseEvent } from "react";
import { ActionIcon } from "@mantine/core";
import { Heart } from "lucide-react";
import { motion } from "motion/react";
import { useFavorite } from "@/features/favorites/hooks/useFavorite";
import { COLORS } from "@/shared/theme/colors";
import ClickSpark from "@/shared/vendor/react-bits/ClickSpark/ClickSpark";
import classes from "./FavoriteButton.module.scss";

// Adding a favorite pops the heart and throws a few sparks; removing it is quiet
const HEART_POP = { scale: [1, 1.35, 1] };
const HEART_REST = { scale: 1 };
const HEART_PRESS = { scale: 0.85 };
const POP_DURATION = 0.35;
const SPARKS = { count: 8, size: 8, radius: 18, durationMs: 400 };
// ClickSpark fills its parent by default (inline style); here it should hug the button
const SPARK_WRAPPER_STYLE = { display: "inline-block", width: "auto", height: "auto" };

const VARIANTS = {
  // Small round button on a movie card's poster
  overlay: { size: "md", iconSize: 16 },
  // Next to the title on the movie page
  inline: { size: "lg", iconSize: 20 },
} as const;

interface FavoriteButtonProps {
  movieId: number | string;
  variant?: keyof typeof VARIANTS;
  /** Render nothing for logged-out users instead of linking to login. */
  hideWhenLoggedOut?: boolean;
}

export function FavoriteButton({
  movieId,
  variant = "overlay",
  hideWhenLoggedOut = false,
}: FavoriteButtonProps) {
  const { isFavorite, isLoggedIn, disabled, toggle } = useFavorite(movieId);
  const { size, iconSize } = VARIANTS[variant];

  if (hideWhenLoggedOut && !isLoggedIn) return null;

  const handleClick = (event: MouseEvent) => {
    // The button sits inside a clickable card that opens the movie
    event.stopPropagation();
    toggle();
  };

  return (
    <ClickSpark
      style={SPARK_WRAPPER_STYLE}
      sparkColor={COLORS.danger}
      sparkCount={SPARKS.count}
      sparkSize={SPARKS.size}
      sparkRadius={SPARKS.radius}
      duration={SPARKS.durationMs}
      disabled={isFavorite || disabled}
    >
      <motion.div
        className={classes.pop}
        initial={false}
        animate={isFavorite ? HEART_POP : HEART_REST}
        whileTap={HEART_PRESS}
        transition={{ duration: POP_DURATION }}
      >
        <ActionIcon
          size={size}
          radius={variant === "overlay" ? "xl" : undefined}
          variant={variant === "overlay" ? "filled" : "default"}
          color={variant === "overlay" ? (isFavorite ? "red" : "dark") : undefined}
          onClick={handleClick}
          disabled={disabled}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isFavorite}
          className={`${classes.heart} ${isFavorite ? classes.favorited : ""} ${
            variant === "overlay" ? classes.overlay : ""
          }`}
        >
          <Heart size={iconSize} fill={isFavorite ? "currentColor" : "none"} />
        </ActionIcon>
      </motion.div>
    </ClickSpark>
  );
}
