"use client";
import { Box, Card, Group, Image, Text } from "@mantine/core";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { FavoriteButton } from "@/features/favorites/ui/FavoriteButton/FavoriteButton";
import { MOVIE_CARD_SIZES, PLACEHOLDER_POSTER } from "@/features/movies/constants";
import { getImageUrl } from "@/features/movies/lib/images";
import { formatRating } from "@/features/movies/lib/movies";
import type { Movie } from "@/features/movies/types";
import { formatYear } from "@/shared/lib/format";
import { ROUTES } from "@/shared/routes";
import { COLORS } from "@/shared/theme/colors";
import classes from "./MovieCard.module.scss";

interface MovieCardProps {
  movie: Movie;
  size?: keyof typeof MOVIE_CARD_SIZES;
}

export const MovieCard = ({ movie, size = "md" }: MovieCardProps) => {
  const router = useRouter();
  const dimensions = MOVIE_CARD_SIZES[size];

  return (
    <Card
      data-aos="zoom-in"
      data-aos-duration="600"
      shadow="md"
      padding="md"
      radius="md"
      h={dimensions.card}
      className={classes.card}
      onClick={() => router.push(ROUTES.movie(movie.id))}
    >
      <Card.Section>
        <Image
          src={getImageUrl(movie.poster_path)}
          height={dimensions.image}
          alt={movie.title}
          fallbackSrc={PLACEHOLDER_POSTER}
        />
      </Card.Section>

      <Box className={classes.favorite}>
        <FavoriteButton movieId={movie.id} />
      </Box>

      <Text fw={600} size="sm" lineClamp={2} mt="xs" c="white">
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
    </Card>
  );
};
