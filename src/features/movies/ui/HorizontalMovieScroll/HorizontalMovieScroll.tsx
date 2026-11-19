"use client";
import type { ReactNode } from "react";
import { Box, Group, ScrollArea } from "@mantine/core";
import { ROW_CARD_WIDTH, ROW_SKELETON_COUNT } from "@/entities/movie/constants";
import type { MovieSummary } from "@/entities/movie/types";
import { ActionMovieCard } from "@/features/movies/ui/ActionMovieCard/ActionMovieCard";
import { MovieCardSkeleton } from "@/entities/movie/ui/MovieCardSkeleton/MovieCardSkeleton";
import { Reveal } from "@/shared/ui/motion/Reveal";
import { SectionTitle } from "@/shared/ui/SectionTitle/SectionTitle";
import classes from "./HorizontalMovieScroll.module.scss";

interface HorizontalMovieScrollProps {
  title: string;
  icon: ReactNode;
  movies: MovieSummary[];
  loading?: boolean;
  /** Shown at the end of the title line, e.g. a "See all" link. */
  action?: ReactNode;
}

export const HorizontalMovieScroll = ({
  title,
  icon,
  movies,
  loading,
  action,
}: HorizontalMovieScrollProps) => (
  <Box mb="xl">
    <Group justify="space-between" align="baseline" wrap="nowrap">
      <SectionTitle icon={icon}>{title}</SectionTitle>
      {action}
    </Group>
    {/* Only horizontal: the hover lift and the reveal animation used to add a vertical scrollbar */}
    <ScrollArea scrollbars="x" className={classes.scroll}>
      <Group gap="md" wrap="nowrap" className={classes.track}>
        {loading
          ? Array.from({ length: ROW_SKELETON_COUNT }, (_, index) => (
              <MovieCardSkeleton key={index} size="sm" width={ROW_CARD_WIDTH} />
            ))
          : movies.map((movie, index) => (
              <Reveal key={movie.id} index={index} className={classes.item}>
                <Box w={ROW_CARD_WIDTH}>
                  <ActionMovieCard movie={movie} size="sm" />
                </Box>
              </Reveal>
            ))}
      </Group>
    </ScrollArea>
  </Box>
);
