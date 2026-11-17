import { Box } from "@mantine/core";
import { CARD_SKELETON_HEIGHT } from "@/features/movies/constants";
import classes from "./MovieCardSkeleton.module.scss";

/** Placeholder with the size of a movie card while the list loads. */
export function MovieCardSkeleton({ width }: { width?: number }) {
  return (
    <Box w={width} h={CARD_SKELETON_HEIGHT} className={`loading-skeleton ${classes.skeleton}`} />
  );
}
