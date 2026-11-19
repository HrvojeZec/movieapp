"use client";
import { useId, ViewTransition } from "react";
import { Box, Card, Group, Image, Stack, Text } from "@mantine/core";
import { Star } from "lucide-react";
import { FavoriteButton } from "@/features/favorites/ui/FavoriteButton/FavoriteButton";
import { WatchedButton } from "@/features/watched/ui/WatchedButton/WatchedButton";
import { WatchlistButton } from "@/features/watchlist/ui/WatchlistButton/WatchlistButton";
import { MOVIE_CARD_SIZES, PLACEHOLDER_POSTER } from "@/entities/movie/constants";
import { getImageUrl } from "@/entities/movie/lib/images";
import { formatRating } from "@/entities/movie/lib/movies";
import {
  posterTransitionName,
  useViewTransitionStore,
} from "@/entities/movie/store/view-transition.store";
import type { MovieSummary } from "@/entities/movie/types";
import { formatYear } from "@/shared/lib/format";
import { ROUTES } from "@/shared/routes";
import { COLORS } from "@/shared/theme/colors";
import { IntentPrefetchLink } from "@/shared/ui/IntentPrefetchLink/IntentPrefetchLink";
import GlareHover from "@/shared/vendor/react-bits/GlareHover/GlareHover";
import classes from "./MovieCard.module.scss";

interface MovieCardProps {
  movie: MovieSummary;
  size?: keyof typeof MOVIE_CARD_SIZES;
}

export function MovieCard({ movie, size = "md" }: MovieCardProps) {
  const cardId = useId();
  const active = useViewTransitionStore((state) => state.activeCard === cardId);
  const setActive = useViewTransitionStore((state) => state.setActive);
  // Set before the navigation starts, so the poster has its name when the transition begins
  const markActive = () => setActive(cardId);

  return (
    <Card shadow="md" padding={0} radius="md" className={classes.card}>
      <IntentPrefetchLink
        href={ROUTES.movie(movie.id)}
        className={classes.link}
        onPointerDown={markActive}
        onClick={markActive}
      >
        {/* Only the clicked card names its poster: the same movie can be in two rows */}
        <ViewTransition
          name={active ? posterTransitionName(movie.id) : undefined}
          share="morph"
          default="none"
        >
          {/* A light sweep across the poster on hover */}
          <GlareHover width="100%" borderRadius="0" glareOpacity={0.25} rimGlint={false}>
            <Image
              src={getImageUrl(movie.poster_path)}
              h={MOVIE_CARD_SIZES[size].image}
              alt={movie.title}
              fallbackSrc={PLACEHOLDER_POSTER}
            />
          </GlareHover>
        </ViewTransition>

        <Box p="md">
          <Text fw={600} size="sm" lineClamp={2} c="white" className={classes.title}>
            {movie.title}
          </Text>

          <Group justify="space-between" mt="xs">
            <Group gap={4}>
              <Star size={12} fill={COLORS.rating} color={COLORS.rating} />
              <Text size="xs" c="dimmed">
                {formatRating(movie.vote_average)}
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              {formatYear(movie.release_date)}
            </Text>
          </Group>
        </Box>
      </IntentPrefetchLink>

      {/* The heart for everyone, the eye once logged in, the bookmark only on plans with a watchlist */}
      <Stack gap={6} className={classes.favorite}>
        <FavoriteButton movieId={movie.id} />
        <WatchedButton movieId={movie.id} />
        <WatchlistButton movieId={movie.id} />
      </Stack>
    </Card>
  );
}
