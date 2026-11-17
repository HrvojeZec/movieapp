"use client";
import { Badge, Box, Button, Container, Group, Text, Title } from "@mantine/core";
import { PlayCircle, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { HERO_HEIGHT } from "@/features/movies/constants";
import { getImageUrl } from "@/features/movies/lib/images";
import { formatRating } from "@/features/movies/lib/movies";
import type { Movie } from "@/features/movies/types";
import { formatYear } from "@/shared/lib/format";
import { ROUTES } from "@/shared/routes";
import classes from "./MovieHero.module.scss";

interface MovieHeroProps {
  movie: Movie;
  onPlayTrailer: () => void;
}

/** Full-width backdrop with the featured movie on the home page. */
export function MovieHero({ movie, onPlayTrailer }: MovieHeroProps) {
  const router = useRouter();

  return (
    <Box
      data-aos="fade-in"
      data-aos-duration="1000"
      h={HERO_HEIGHT}
      className={classes.hero}
      style={{ backgroundImage: `url(${getImageUrl(movie.backdrop_path, "w1280")})` }}
    >
      <Container size="xl" h="100%" className={classes.content}>
        <Box maw={600} data-aos="fade-right" data-aos-delay="300">
          <Title size="3rem" fw={700} c="white" mb="md">
            {movie.title}
          </Title>
          <Text size="lg" c="gray.3" mb="md" lineClamp={3}>
            {movie.overview}
          </Text>
          <Group gap="md" mb="xl">
            <Badge leftSection={<Star size={14} />} variant="filled" color="yellow">
              {formatRating(movie.vote_average)} TMDB
            </Badge>
            <Text c="gray.4">{formatYear(movie.release_date)}</Text>
          </Group>
          <Group data-aos="fade-up" data-aos-delay="600">
            <Button leftSection={<PlayCircle size={20} />} size="lg" onClick={onPlayTrailer}>
              Play trailer
            </Button>
            <Button
              variant="outline"
              size="lg"
              c="white"
              onClick={() => router.push(ROUTES.movie(movie.id))}
            >
              More info
            </Button>
          </Group>
        </Box>
      </Container>
    </Box>
  );
}
