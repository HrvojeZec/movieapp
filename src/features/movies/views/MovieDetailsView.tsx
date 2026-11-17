"use client";
import { useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  Container,
  Title,
  Text,
  Group,
  Badge,
  Stack,
  Box,
  ActionIcon,
  Avatar,
  SimpleGrid,
  Loader,
  Center,
  Paper,
  Button,
} from "@mantine/core";
import { Heart, Star, Clock, MapPin, Calendar, PlayCircle } from "lucide-react";
import { getImageUrl } from "@/features/movies/lib/images";
import { useMovieDetails } from "@/features/movies/hooks/useMovieDetails";
import { QueryError } from "@/shared/ui/QueryError/QueryError";
import { HttpError } from "@/shared/lib/http";
import { TrailerModal } from "@/features/movies/ui/TrailerModal/TrailerModal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useToggleFavorite } from "@/features/favorites/hooks/useToggleFavorite";

export function MovieDetailsView() {
  const params = useParams();
  const { user } = useAuth();
  const toggleFavorite = useToggleFavorite();
  const [trailerModalOpened, setTrailerModalOpened] = useState(false);

  const movieId = params.id as string;
  const isFavorited = user?.favorites?.includes(movieId) || false;
  const { data: movie, isPending, error, refetch } = useMovieDetails(Number(movieId));

  if (isPending) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (error && !(error instanceof HttpError && error.status === 404)) {
    return (
      <Container size="xl" py="xl">
        <QueryError message="We couldn't load this movie." onRetry={() => refetch()} />
      </Container>
    );
  }

  if (!movie) {
    return (
      <Container size="xl" py="xl">
        <Center h={400}>
          <Text size="xl" c="dimmed">
            Movie not found
          </Text>
        </Center>
      </Container>
    );
  }

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div>
      <Box
        data-aos="fade-in"
        data-aos-duration="1000"
        /*  h={500} */
        style={{
          backgroundImage: `url(${getImageUrl(movie.backdrop_path, "w1280")})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        <Container
          size="xl"
          h="100%"
          style={{ display: "flex", alignItems: "center", padding: "1.5rem" }}
        >
          <Group gap="xl" align="flex-start">
            <Image
              src={getImageUrl(movie.poster_path, "w500")}
              alt={movie.title}
              width={300}
              height={450}
              style={{ borderRadius: 12 }}
            />

            <Stack gap="md" maw={700}>
              <Group>
                <Title size="2.5rem" fw={700} c="white">
                  {movie.title}
                </Title>
                {user && (
                  <ActionIcon
                    size="lg"
                    variant="default"
                    onClick={() => toggleFavorite(movieId)}
                    aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                    aria-pressed={isFavorited}
                    className={`favorite-heart ${isFavorited ? "favorited" : ""}`}
                  >
                    <Heart size={20} fill={isFavorited ? "currentColor" : "none"} />
                  </ActionIcon>
                )}
              </Group>

              <Group gap="md">
                <Badge leftSection={<Star size={14} />} size="lg" variant="filled" color="yellow">
                  {movie.vote_average.toFixed(1)}
                </Badge>
                <Badge leftSection={<Calendar size={14} />} size="lg" variant="outline">
                  {movie.release_date?.split("-")[0]}
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
                <Button
                  leftSection={<PlayCircle size={18} />}
                  size="md"
                  className="blue"
                  onClick={() => setTrailerModalOpened(true)}
                >
                  Watch Trailer
                </Button>
              </Group>
              <Group gap="md">
                <Group gap="xs">
                  <MapPin size={16} color="#9ca3af" />
                  <Text c="gray.4">{movie.production_countries.map((c) => c.name).join(", ")}</Text>
                </Group>
              </Group>
            </Stack>
          </Group>
        </Container>
      </Box>
      <TrailerModal
        opened={trailerModalOpened}
        onClose={() => setTrailerModalOpened(false)}
        movieId={parseInt(movieId)}
        movieTitle={movie.title}
      />

      <Container size="xl" py="xl">
        <Stack gap="xl">
          <Title size="xl" fw={600} c="white">
            Cast
          </Title>

          <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 6 }} spacing="md">
            {movie.credits?.cast.slice(0, 12).map((actor) => (
              <Paper
                key={actor.id}
                p="md"
                bg="dark.7"
                radius="md"
                style={{ border: "1px solid rgba(255, 255, 255, 0.1)" }}
              >
                <Stack align="center" gap="sm">
                  <Avatar
                    src={actor.profile_path ? getImageUrl(actor.profile_path, "w200") : null}
                    size="lg"
                    radius="md"
                  />
                  <Stack gap={2} align="center">
                    <Text size="sm" fw={500} c="white" ta="center" lineClamp={1}>
                      {actor.name}
                    </Text>
                    <Text size="xs" c="dimmed" ta="center" lineClamp={1}>
                      {actor.character}
                    </Text>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    </div>
  );
}
