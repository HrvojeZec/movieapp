"use client";
import type { ReactNode } from "react";
import { SimpleGrid } from "@mantine/core";
import { GRID_COLUMNS, GRID_SKELETON_COUNT } from "@/features/movies/constants";
import type { Movie } from "@/features/movies/types";
import { MovieCard } from "@/features/movies/ui/MovieCard/MovieCard";
import { MovieCardSkeleton } from "@/features/movies/ui/MovieCardSkeleton/MovieCardSkeleton";
import { Reveal } from "@/shared/ui/motion/Reveal";

interface MovieGridProps {
  movies: Movie[];
  loading?: boolean;
  /** Wraps each card, e.g. to make it swipeable. */
  renderCard?: (movie: Movie, card: ReactNode) => ReactNode;
}

export const MovieGrid = ({ movies, loading, renderCard }: MovieGridProps) => (
  <SimpleGrid cols={GRID_COLUMNS} spacing="lg">
    {loading
      ? Array.from({ length: GRID_SKELETON_COUNT }, (_, index) => <MovieCardSkeleton key={index} />)
      : movies.map((movie, index) => (
          <Reveal key={movie.id} index={index}>
            {renderCard ? (
              renderCard(movie, <MovieCard movie={movie} />)
            ) : (
              <MovieCard movie={movie} />
            )}
          </Reveal>
        ))}
  </SimpleGrid>
);
