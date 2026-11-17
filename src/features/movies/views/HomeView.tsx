"use client";
import { useState } from "react";
import { Container, Title, Text, Stack, Box, Group, Badge, Button } from "@mantine/core";
import { Clapperboard, PlayCircle, Star, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { getImageUrl } from "@/features/movies/lib/images";
import { useGenres } from "@/features/movies/hooks/useGenres";
import { useMovieList } from "@/features/movies/hooks/useMovieList";
import { MovieGrid } from "@/features/movies/ui/MovieGrid/MovieGrid";
import { HorizontalMovieScroll } from "@/features/movies/ui/HorizontalMovieScroll/HorizontalMovieScroll";
import { GenreRow } from "@/features/movies/ui/GenreRow/GenreRow";
import { TrailerModal } from "@/features/movies/ui/TrailerModal/TrailerModal";
import { QueryError } from "@/shared/ui/QueryError/QueryError";

const GENRE_ROWS = 10;

export function HomeView() {
  const popular = useMovieList("popular");
  const nowPlaying = useMovieList("now_playing");
  const topRated = useMovieList("top_rated");
  const genres = useGenres();
  const [trailerModalOpened, setTrailerModalOpened] = useState(false);
  const router = useRouter();

  const heroMovie = popular.data?.results[0];

  return (
    <>
      <div>
        {popular.isError && (
          <Container size="xl" pt="xl">
            <QueryError onRetry={() => popular.refetch()} />
          </Container>
        )}
        {popular.isPending && <Box h={600} className="loading-skeleton" />}
        {heroMovie && (
          <Box
            data-aos="fade-in"
            data-aos-duration="1000"
            h={600}
            style={{
              backgroundImage: `url(${getImageUrl(heroMovie.backdrop_path, "w1280")})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
            }}
            className="hero-section"
          >
            <Container size="xl" h="100%" style={{ display: "flex", alignItems: "center" }}>
              <Box maw={600} data-aos="fade-right" data-aos-delay="300">
                <Title size="3rem" fw={700} c="white" mb="md">
                  {heroMovie.title}
                </Title>
                <Text size="lg" c="gray.3" mb="md" lineClamp={3}>
                  {heroMovie.overview}
                </Text>
                <Group gap="md" mb="xl">
                  <Badge leftSection={<Star size={14} />} variant="filled" color="yellow">
                    {heroMovie.vote_average.toFixed(1)} IMDb
                  </Badge>
                  <Text c="gray.4">{heroMovie.release_date?.split("-")[0]}</Text>
                </Group>
                <Group data-aos="fade-up" data-aos-delay="600">
                  <Button
                    leftSection={<PlayCircle size={20} />}
                    size="lg"
                    className="blue"
                    onClick={() => setTrailerModalOpened(true)}
                  >
                    watch now
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    c="white"
                    onClick={() => router.push(`/movie/${heroMovie.id}`)}
                  >
                    more info
                  </Button>
                </Group>
              </Box>
            </Container>
          </Box>
        )}

        <Container size="xl" py="xl">
          <Stack gap="xl">
            <div data-aos="fade-up" data-aos-delay="200">
              {nowPlaying.isError ? (
                <QueryError onRetry={() => nowPlaying.refetch()} />
              ) : (
                <HorizontalMovieScroll
                  title={
                    <Group gap={8} align="center">
                      <Clapperboard size={18} />
                      <Text>Now Playing</Text>
                    </Group>
                  }
                  movies={nowPlaying.data?.results ?? []}
                  loading={nowPlaying.isPending}
                />
              )}
            </div>

            <div data-aos="fade-up" data-aos-delay="400">
              <Box>
                <Group gap={8} align="center" mb="md">
                  <Trophy size={24} color="gold" />
                  <Title size="xl" fw={700} c="white">
                    Top rated
                  </Title>
                </Group>
                {topRated.isError ? (
                  <QueryError onRetry={() => topRated.refetch()} />
                ) : (
                  <MovieGrid
                    movies={topRated.data?.results.slice(0, 6) ?? []}
                    loading={topRated.isPending}
                  />
                )}
              </Box>
            </div>

            {genres.isError && <QueryError onRetry={() => genres.refetch()} />}
            {genres.data?.slice(0, GENRE_ROWS).map((genre) => (
              <GenreRow key={genre.id} genre={genre} />
            ))}
          </Stack>
        </Container>
      </div>
      {heroMovie && (
        <TrailerModal
          opened={trailerModalOpened}
          onClose={() => setTrailerModalOpened(false)}
          movieId={heroMovie.id}
          movieTitle={heroMovie.title}
        />
      )}
    </>
  );
}
