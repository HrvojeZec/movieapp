"use client";
import { Card, Group, Image, Text } from "@mantine/core";
import { ListVideo } from "lucide-react";
import type { MovieListSummary } from "@/features/lists/types";
import { PLACEHOLDER_POSTER } from "@/features/movies/constants";
import { useMoviesByIds } from "@/features/movies/hooks/useMoviesByIds";
import { getImageUrl } from "@/features/movies/lib/images";
import { formatRelativeTime, pluralize } from "@/shared/lib/format";
import { ROUTES } from "@/shared/routes";
import { IntentPrefetchLink } from "@/shared/ui/IntentPrefetchLink/IntentPrefetchLink";
import classes from "./ListCard.module.scss";

/** A list on the lists page: its latest posters, name and size; opens the list. */
export function ListCard({ list }: { list: MovieListSummary }) {
  const { movies } = useMoviesByIds(list.coverMovieIds.map(Number));

  return (
    <Card padding={0} radius="md" className={classes.card}>
      <IntentPrefetchLink href={ROUTES.list(list.id)} className={classes.link}>
        <div className={classes.covers}>
          {movies.length > 0 ? (
            movies.map((movie) => (
              <Image
                key={movie.id}
                src={getImageUrl(movie.poster_path)}
                alt=""
                fallbackSrc={PLACEHOLDER_POSTER}
                className={classes.cover}
              />
            ))
          ) : (
            <ListVideo size={40} className={classes.emptyIcon} aria-hidden />
          )}
        </div>
        <Group justify="space-between" p="md" wrap="nowrap" gap="xs">
          <Text fw={600} c="white" truncate>
            {list.name}
          </Text>
          <Text size="xs" c="dimmed" className={classes.meta}>
            {list.movieCount} {pluralize(list.movieCount, "movie")} ·{" "}
            {formatRelativeTime(list.updatedAt)}
          </Text>
        </Group>
      </IntentPrefetchLink>
    </Card>
  );
}
