"use client";
import type { MouseEvent } from "react";
import { ActionIcon } from "@mantine/core";
import { Heart } from "lucide-react";
import { useFavorite } from "@/features/favorites/hooks/useFavorite";
import classes from "./FavoriteButton.module.scss";

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
  );
}
