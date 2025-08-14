"use client";
import { SimpleGrid, Box } from "@mantine/core";
import { Movie } from "@/lib/external/tmdb";
import { MovieCard } from "./MovieCard";

interface MovieGridProps {
  movies: Movie[];
  loading?: boolean;
}

export const MovieGrid = ({ movies, loading }: MovieGridProps) => {
  if (loading) {
    return (
      <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 6 }} spacing="lg">
        {Array.from({ length: 12 }).map((_, index) => (
          <Box
            key={index}
            h={340}
            bg="dark.6"
            style={{ borderRadius: 8 }}
            className="loading-skeleton"
          />
        ))}
      </SimpleGrid>
    );
  }

  return (
    <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 6 }} spacing="lg">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </SimpleGrid>
  );
};
