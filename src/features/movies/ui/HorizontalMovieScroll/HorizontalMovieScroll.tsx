"use client";
import type { ReactNode } from "react";
import { Box, Group, ScrollArea } from "@mantine/core";
import { ROW_CARD_WIDTH, ROW_SKELETON_COUNT } from "@/features/movies/constants";
import type { MovieSummary } from "@/features/movies/types";
import { MovieCard } from "@/features/movies/ui/MovieCard/MovieCard";
import { MovieCardSkeleton } from "@/features/movies/ui/MovieCardSkeleton/MovieCardSkeleton";
import { Reveal } from "@/shared/ui/motion/Reveal";
import { SectionTitle } from "@/shared/ui/SectionTitle/SectionTitle";
import classes from "./HorizontalMovieScroll.module.scss";

interface HorizontalMovieScrollProps {
  title: string;
  icon: ReactNode;
  movies: MovieSummary[];
  loading?: boolean;
}

export const HorizontalMovieScroll = ({
  title,
  icon,
  movies,
  loading,
}: HorizontalMovieScrollProps) => (
  <Box mb="xl">
    <SectionTitle icon={icon}>{title}</SectionTitle>
    <ScrollArea>
      <Group gap="md" wrap="nowrap" pb="md">
        {loading
          ? Array.from({ length: ROW_SKELETON_COUNT }, (_, index) => (
              <MovieCardSkeleton key={index} size="sm" width={ROW_CARD_WIDTH} />
            ))
          : movies.map((movie, index) => (
              <Reveal key={movie.id} index={index} className={classes.item}>
                <Box w={ROW_CARD_WIDTH}>
                  <MovieCard movie={movie} size="sm" />
                </Box>
              </Reveal>
            ))}
      </Group>
    </ScrollArea>
  </Box>
);
