"use client";
import { ScrollArea, Group, Text, Box } from "@mantine/core";
import { Movie } from "@/lib/external/tmdb";
import { MovieCard } from "./MovieCard";
import { ReactNode } from "react";

interface HorizontalMovieScrollProps {
  title: ReactNode;
  movies: Movie[];
  loading?: boolean;
}

export const HorizontalMovieScroll = ({
  title,
  movies,
  loading,
}: HorizontalMovieScrollProps) => {
  console.log(movies);

  return (
    <Box mb="xl">
      <Text size="xl" fw={700} mb="md" c="white" component="div">
        {title}
      </Text>
      <ScrollArea>
        <Group gap="md" wrap="nowrap" pb="md">
          {loading
            ? Array.from({ length: 8 }).map((_, index) => (
                <Box
                  key={index}
                  w={200}
                  h={340}
                  bg="dark.6"
                  style={{ borderRadius: 8, flexShrink: 0 }}
                  className="loading-skeleton"
                />
              ))
            : movies.map((movie) => (
                <Box key={movie.id} w={200} style={{ flexShrink: 0 }}>
                  <MovieCard movie={movie} size="sm" />
                </Box>
              ))}
        </Group>
      </ScrollArea>
    </Box>
  );
};
