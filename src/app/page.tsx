"use client";
import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Text,
  Stack,
  Box,
  Group,
  Badge,
  Button,
} from "@mantine/core";
import { Clapperboard, Drama, PlayCircle, Star, Trophy } from "lucide-react";
import {
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getGenres,
  getMoviesByGenre,
  Movie,
  Genre,
  getImageUrl,
} from "@/lib/external/tmdb";
import { MovieGrid } from "@/components/Movies/MovieGrid";
import { HorizontalMovieScroll } from "@/components/Movies/HorizontalMovieScroll";
import { TrailerModal } from "@/components/Movies/TrailerModal";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
  const [newestMovies, setNewestMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [genreMovies, setGenreMovies] = useState<{ [key: number]: Movie[] }>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [trailerModalOpened, setTrailerModalOpened] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          popularResponse,
          topRatedResponse,
          nowPlayingResponse,
          genresResponse,
        ] = await Promise.all([
          getPopularMovies(),
          getTopRatedMovies(),
          getNowPlayingMovies(),
          getGenres(),
        ]);

        setHeroMovie(popularResponse.results[0]);

        setNewestMovies(nowPlayingResponse.results.slice(0, 20));
        setTopRatedMovies(topRatedResponse.results.slice(0, 20));
        setGenres(genresResponse.slice(0, 10));
        console.log(genresResponse);

        const genreMoviePromises = genresResponse
          .slice(0, 10)
          .map(async (genre) => {
            const movies = await getMoviesByGenre(genre.id);
            return { genreId: genre.id, movies: movies.results.slice(0, 20) };
          });

        const genreMovieResults = await Promise.all(genreMoviePromises);
        const genreMoviesMap = genreMovieResults.reduce(
          (acc, { genreId, movies }) => {
            acc[genreId] = movies;
            return acc;
          },
          {} as { [key: number]: Movie[] }
        );

        setGenreMovies(genreMoviesMap);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <div>
        {heroMovie && (
          <Box
            data-aos="fade-in"
            data-aos-duration="1000"
            h={600}
            style={{
              backgroundImage: `url(${getImageUrl(
                heroMovie.backdrop_path,
                "w1280"
              )})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
            }}
            className="hero-section"
          >
            <Container
              size="xl"
              h="100%"
              style={{ display: "flex", alignItems: "center" }}
            >
              <Box maw={600} data-aos="fade-right" data-aos-delay="300">
                <Title size="3rem" fw={700} c="white" mb="md">
                  {heroMovie.title}
                </Title>
                <Text size="lg" c="gray.3" mb="md" lineClamp={3}>
                  {heroMovie.overview}
                </Text>
                <Group gap="md" mb="xl">
                  <Badge
                    leftSection={<Star size={14} />}
                    variant="filled"
                    color="yellow"
                  >
                    {heroMovie.vote_average.toFixed(1)} IMDb
                  </Badge>
                  <Text c="gray.4">
                    {heroMovie.release_date?.split("-")[0]}
                  </Text>
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
              <HorizontalMovieScroll
                title={
                  <Group gap={8} align="center">
                    <Clapperboard size={18} />
                    <Text>Now Playing</Text>
                  </Group>
                }
                movies={newestMovies}
                loading={loading}
              />
            </div>

            <div data-aos="fade-up" data-aos-delay="400">
              <Box>
                <Group gap={8} align="center" mb="md">
                  <Trophy size={24} color="gold" />
                  <Title size="xl" fw={700} c="white">
                    Top rated
                  </Title>
                </Group>
                <MovieGrid
                  movies={topRatedMovies.slice(0, 6)}
                  loading={loading}
                />
              </Box>
            </div>

            {genres.map((genre, index) => (
              <div
                key={genre.id}
                data-aos="fade-up"
                data-aos-delay={600 + index * 100}
              >
                <HorizontalMovieScroll
                  title={
                    <Group gap={8} align="center">
                      <Drama size={18} />
                      <Text>{genre.name}</Text>
                    </Group>
                  }
                  movies={genreMovies[genre.id] || []}
                  loading={loading}
                />
              </div>
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
