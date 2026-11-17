"use client";
import { SimpleGrid } from "@mantine/core";
import { GRID_COLUMNS, GRID_SKELETON_COUNT } from "@/features/movies/constants";
import type { Movie } from "@/features/movies/types";
import { MovieCard } from "@/features/movies/ui/MovieCard/MovieCard";
import { MovieCardSkeleton } from "@/features/movies/ui/MovieCardSkeleton/MovieCardSkeleton";
import { Reveal } from "@/shared/ui/motion/Reveal";

interface MovieGridProps {
  movies: Movie[];
  loading?: boolean;
}

export const MovieGrid = ({ movies, loading }: MovieGridProps) => (
  <SimpleGrid cols={GRID_COLUMNS} spacing="lg">
    {loading
      ? Array.from({ length: GRID_SKELETON_COUNT }, (_, index) => <MovieCardSkeleton key={index} />)
      : movies.map((movie, index) => (
          <Reveal key={movie.id} index={index}>
            <MovieCard movie={movie} />
          </Reveal>
        ))}
  </SimpleGrid>
);
