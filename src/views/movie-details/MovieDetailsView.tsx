"use client";
import { ViewTransition } from "react";
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
import { useAuth } from "@/entities/user/hooks/useAuth";
import { FavoriteButton } from "@/features/toggle-favorite/ui/FavoriteButton/FavoriteButton";
import { AddToListMenu } from "@/features/manage-lists/ui/AddToListMenu/AddToListMenu";
import { WatchedButton } from "@/features/mark-watched/ui/WatchedButton/WatchedButton";
import { WatchlistButton } from "@/features/toggle-watchlist/ui/WatchlistButton/WatchlistButton";
import { useMovieDetails } from "@/entities/movie/hooks/useMovieDetails";
import { useTrackRecentlyViewed } from "@/entities/movie/hooks/useRecentlyViewed";
import { useTrackMovieView } from "@/entities/movie/hooks/useTrackMovieView";
import { getImageUrl } from "@/entities/movie/lib/images";
import { posterTransitionName } from "@/entities/movie/store/view-transition.store";
import { formatRating } from "@/entities/movie/lib/movies";
import { CastGrid } from "@/entities/movie/ui/CastGrid/CastGrid";
import { TrailerModal } from "@/entities/movie/ui/TrailerModal/TrailerModal";
import { formatRuntime, formatYear } from "@/shared/lib/format";
import { HttpError } from "@/shared/lib/http";
import { HTTP_STATUS } from "@/shared/lib/http-status";
import { COLORS } from "@/shared/theme/colors";
import { QueryError } from "@/shared/ui/QueryError/QueryError";
import TiltedCard from "@/shared/vendor/react-bits/TiltedCard/TiltedCard";
import classes from "./MovieDetailsView.module.scss";

const POSTER = { width: 300, height: 450, radius: 12 };
// Subtle: the poster leans toward the pointer, it doesn't spin
const POSTER_TILT_DEGREES = 8;
const POSTER_HOVER_SCALE = 1.03;
const NOT_FOUND_HEIGHT = 400;

export function MovieDetailsView() {
  const params = useParams<{ id: string }>();
  const movieId = Number(params.id);
  const [trailerOpened, trailer] = useDisclosure(false);
  const { data: movie, isPending, error, refetch } = useMovieDetails(movieId);
  useTrackRecentlyViewed(movie);
  useTrackMovieView(movie?.id);
  const { user } = useAuth();

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
        className={classes.backdrop}
        data-movie-hero
        style={{ backgroundImage: `url(${getImageUrl(movie.backdrop_path, "w1280")})` }}
      >
        <Container size="xl" h="100%" className={classes.header}>
          <Group gap="xl" align="flex-start">
            {/* The poster of the card that was clicked lands here (one name for both sizes) */}
            <ViewTransition name={posterTransitionName(movie.id)} share="morph" default="none">
              <Box>
                {/* Tilts toward the pointer on desktop; a plain image on touch screens */}
                <Box visibleFrom="md">
                  <TiltedCard
                    imageSrc={getImageUrl(movie.poster_path, "w500")}
                    altText={movie.title}
                    containerWidth={POSTER.width}
                    containerHeight={POSTER.height}
                    imageWidth={POSTER.width}
                    imageHeight={POSTER.height}
                    radius={POSTER.radius}
                    rotateAmplitude={POSTER_TILT_DEGREES}
                    scaleOnHover={POSTER_HOVER_SCALE}
                    showTooltip={false}
                    flipOnClick={false}
                    gyroscope={false}
                    intro={false}
                  />
                </Box>
                <Box hiddenFrom="md">
                  <Image
                    src={getImageUrl(movie.poster_path, "w500")}
                    alt={movie.title}
                    width={POSTER.width}
                    height={POSTER.height}
                    className={classes.poster}
                  />
                </Box>
              </Box>
            </ViewTransition>

            <Stack gap="md" maw={700}>
              <Group>
                <Title size="2.5rem" fw={700} c="white">
                  {movie.title}
                </Title>
                <FavoriteButton movieId={movie.id} variant="inline" hideWhenLoggedOut />
              </Group>

              {/* Personal actions; every one of them needs an account */}
              {user && (
                <Group gap="sm">
                  <WatchlistButton movieId={movie.id} variant="inline" />
                  <WatchedButton movieId={movie.id} variant="inline" />
                  <AddToListMenu movieId={movie.id} />
                </Group>
              )}

              <Group gap="md">
                <Badge leftSection={<Star size={14} />} size="lg" variant="filled" color="yellow">
                  {formatRating(movie.vote_average)}
                </Badge>
                <Badge leftSection={<Calendar size={14} />} size="lg" className={classes.chip}>
                  {formatYear(movie.release_date)}
                </Badge>
                <Badge leftSection={<Clock size={14} />} size="lg" className={classes.chip}>
                  {formatRuntime(movie.runtime)}
                </Badge>
              </Group>

              <Group gap="xs">
                {movie.genres.map((genre) => (
                  <Badge key={genre.id} size="sm" className={classes.chip}>
                    {genre.name}
                  </Badge>
                ))}
              </Group>

              <Text size="lg" c="gray.3" lineClamp={4}>
                {movie.overview}
              </Text>
              <Group gap="md" mt="md">
                <Button leftSection={<PlayCircle size={18} />} size="md" onClick={trailer.open}>
                  Play trailer
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
