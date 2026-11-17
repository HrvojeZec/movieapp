"use client";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  Badge,
  Box,
  Button,
  Center,
  Container,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Calendar, Clock, MapPin, PlayCircle, Star } from "lucide-react";
import { FavoriteButton } from "@/features/favorites/ui/FavoriteButton/FavoriteButton";
import { useMovieDetails } from "@/features/movies/hooks/useMovieDetails";
import { getImageUrl } from "@/features/movies/lib/images";
import { formatRating } from "@/features/movies/lib/movies";
import { CastGrid } from "@/features/movies/ui/CastGrid/CastGrid";
import { TrailerModal } from "@/features/movies/ui/TrailerModal/TrailerModal";
import { formatRuntime, formatYear } from "@/shared/lib/format";
import { HttpError } from "@/shared/lib/http";
import { HTTP_STATUS } from "@/shared/lib/http-status";
import { COLORS } from "@/shared/theme/colors";
import { QueryError } from "@/shared/ui/QueryError/QueryError";
import classes from "./MovieDetailsView.module.scss";

const POSTER = { width: 300, height: 450 };
const NOT_FOUND_HEIGHT = 400;

export function MovieDetailsView() {
  const params = useParams<{ id: string }>();
  const movieId = Number(params.id);
  const [trailerOpened, trailer] = useDisclosure(false);
  const { data: movie, isPending, error, refetch } = useMovieDetails(movieId);

  if (isPending) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (error && !(error instanceof HttpError && error.status === HTTP_STATUS.NOT_FOUND)) {
    return (
      <Container size="xl" py="xl">
        <QueryError message="We couldn't load this movie." onRetry={() => refetch()} />
      </Container>
    );
  }

  if (!movie) {
    return (
      <Container size="xl" py="xl">
        <Center h={NOT_FOUND_HEIGHT}>
          <Text size="xl" c="dimmed">
            Movie not found
          </Text>
        </Center>
      </Container>
    );
  }

  return (
    <div>
      <Box
        data-aos="fade-in"
        data-aos-duration="1000"
        className={classes.backdrop}
        style={{ backgroundImage: `url(${getImageUrl(movie.backdrop_path, "w1280")})` }}
      >
        <Container size="xl" h="100%" className={classes.header}>
          <Group gap="xl" align="flex-start">
            <Image
              src={getImageUrl(movie.poster_path, "w500")}
              alt={movie.title}
              width={POSTER.width}
              height={POSTER.height}
              className={classes.poster}
            />

            <Stack gap="md" maw={700}>
              <Group>
                <Title size="2.5rem" fw={700} c="white">
                  {movie.title}
                </Title>
                <FavoriteButton movieId={movie.id} variant="inline" hideWhenLoggedOut />
              </Group>

              <Group gap="md">
                <Badge leftSection={<Star size={14} />} size="lg" variant="filled" color="yellow">
                  {formatRating(movie.vote_average)}
                </Badge>
                <Badge leftSection={<Calendar size={14} />} size="lg" variant="outline">
                  {formatYear(movie.release_date)}
                </Badge>
                <Badge leftSection={<Clock size={14} />} size="lg" variant="outline">
                  {formatRuntime(movie.runtime)}
                </Badge>
              </Group>

              <Group gap="xs">
                {movie.genres.map((genre) => (
                  <Badge key={genre.id} variant="light" size="sm">
                    {genre.name}
                  </Badge>
                ))}
              </Group>

              <Text size="lg" c="gray.3" lineClamp={4}>
                {movie.overview}
              </Text>
              <Group gap="md" mt="md">
                <Button leftSection={<PlayCircle size={18} />} size="md" onClick={trailer.open}>
                  Watch Trailer
                </Button>
              </Group>
              <Group gap="xs">
                <MapPin size={16} color={COLORS.muted} />
                <Text c="gray.4">{movie.production_countries.map((c) => c.name).join(", ")}</Text>
              </Group>
            </Stack>
          </Group>
        </Container>
      </Box>

      <TrailerModal
        opened={trailerOpened}
        onClose={trailer.close}
        movieId={movie.id}
        movieTitle={movie.title}
      />

      <Container size="xl" py="xl">
        <CastGrid cast={movie.credits?.cast ?? []} />
      </Container>
    </div>
  );
}
