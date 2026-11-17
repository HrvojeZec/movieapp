import { Box } from "@mantine/core";
import { CARD_BODY_HEIGHT, MOVIE_CARD_SIZES } from "@/features/movies/constants";
import classes from "./MovieCardSkeleton.module.scss";

interface MovieCardSkeletonProps {
  size?: keyof typeof MOVIE_CARD_SIZES;
  width?: number;
}

/** Placeholder with the size of a movie card while the list loads. */
export function MovieCardSkeleton({ size = "md", width }: MovieCardSkeletonProps) {
  return (
    <Box
      w={width}
      h={MOVIE_CARD_SIZES[size].image + CARD_BODY_HEIGHT}
      className={`loading-skeleton ${classes.skeleton}`}
    />
  );
}
