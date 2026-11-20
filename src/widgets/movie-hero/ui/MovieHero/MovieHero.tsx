"use client";
import { Badge, Box, Button, Container, Group, Text, Title } from "@mantine/core";
import { PlayCircle, Star } from "lucide-react";
import { useAppRouter } from "@/shared/hooks/useAppRouter";
import { HERO_HEIGHT } from "@/entities/movie/constants";
import { getImageUrl } from "@/entities/movie/lib/images";
import { formatRating, hasRating } from "@/entities/movie/lib/movies";
import type { Movie } from "@/entities/movie/types";
import { formatYear } from "@/shared/lib/format";
import { ROUTES } from "@/shared/routes";
import GradualBlur from "@/shared/vendor/react-bits/GradualBlur/GradualBlur";
import { FilmGrain } from "./FilmGrain";
import classes from "./MovieHero.module.scss";
import { Magnetic } from "@/shared/ui/motion/Magnetic";

// The hero blurs into the page instead of ending in a hard edge
const EDGE_BLUR_HEIGHT = "6rem";

interface MovieHeroProps {
  movie: Movie;
  onPlayTrailer: () => void;
}

/** Full-width backdrop with the featured movie on the home page. */
export function MovieHero({ movie, onPlayTrailer }: MovieHeroProps) {
  const router = useAppRouter();

  return (
    <Box
      h={HERO_HEIGHT}
      className={classes.hero}
      style={{ backgroundImage: `url(${getImageUrl(movie.backdrop_path, "w1280")})` }}
    >
      <FilmGrain />
      <Container size="xl" h="100%" className={classes.content}>
        <Box maw={600} className={classes.copy}>
          <Title size="3rem" fw={700} c="white" mb="md">
            {movie.title}
          </Title>
          <Text size="lg" c="gray.3" mb="md" lineClamp={3}>
            {movie.overview}
          </Text>
          <Group gap="md" mb="xl">
            <Badge leftSection={<Star size={14} />} variant="filled" color="yellow">
              {formatRating(movie.vote_average)}
              {hasRating(movie.vote_average) && " TMDB"}
            </Badge>
            <Text c="gray.4">{formatYear(movie.release_date)}</Text>
          </Group>
          <Group className={classes.actions}>
            <Magnetic>
              <Button leftSection={<PlayCircle size={20} />} size="lg" onClick={onPlayTrailer}>
                Play trailer
              </Button>
            </Magnetic>
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
      <GradualBlur position="bottom" target="parent" height={EDGE_BLUR_HEIGHT} strength={2} />
    </Box>
  );
}
