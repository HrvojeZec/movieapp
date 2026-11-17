"use client";
import { Group, Text } from "@mantine/core";
import { useIntersection } from "@mantine/hooks";
import { Drama } from "lucide-react";
import { QueryError } from "@/shared/components/QueryError";
import type { Genre } from "../api";
import { useDiscoverMovies } from "../queries";
import { HorizontalMovieScroll } from "./HorizontalMovieScroll";

/** A genre row that only fetches its movies once it scrolls near the viewport. */
export function GenreRow({ genre }: { genre: Genre }) {
  const { ref, entry } = useIntersection<HTMLDivElement>({ rootMargin: "400px" });
  const { data, isPending, isError, refetch } = useDiscoverMovies(
    { genre: genre.id },
    { enabled: Boolean(entry?.isIntersecting) },
  );

  const title = (
    <Group gap={8} align="center">
      <Drama size={18} />
      <Text>{genre.name}</Text>
    </Group>
  );

  return (
    <div ref={ref}>
      {isError ? (
        <QueryError message={`Couldn't load ${genre.name} movies.`} onRetry={() => refetch()} />
      ) : (
        <HorizontalMovieScroll title={title} movies={data?.results ?? []} loading={isPending} />
      )}
    </div>
  );
}
