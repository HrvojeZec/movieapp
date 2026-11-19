"use client";
import { Box, Container, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Clapperboard, Trophy } from "lucide-react";
import { GENRE_ROWS, HERO_HEIGHT, HOME_LISTS, TOP_RATED_LIMIT } from "@/entities/movie/constants";
import { useGenres } from "@/entities/movie/hooks/useGenres";
import { useMovieList } from "@/entities/movie/hooks/useMovieList";
import { GenreRow } from "@/features/movies/ui/GenreRow/GenreRow";
import { HorizontalMovieScroll } from "@/features/movies/ui/HorizontalMovieScroll/HorizontalMovieScroll";
import { MovieGrid } from "@/features/movies/ui/MovieGrid/MovieGrid";
import { MovieHero } from "@/features/movies/ui/MovieHero/MovieHero";
import { RecentlyViewedRow } from "@/features/movies/ui/RecentlyViewedRow/RecentlyViewedRow";
import { TrailerModal } from "@/entities/movie/ui/TrailerModal/TrailerModal";
import { RecommendationsRow } from "@/features/recommendations/ui/RecommendationsRow/RecommendationsRow";
import { QueryError } from "@/shared/ui/QueryError/QueryError";
import { SectionTitle } from "@/shared/ui/SectionTitle/SectionTitle";

export function HomeView() {
  const popular = useMovieList(HOME_LISTS.hero);
  const nowPlaying = useMovieList(HOME_LISTS.nowPlaying);
  const topRated = useMovieList(HOME_LISTS.topRated);
  const genres = useGenres();
  const [trailerOpened, trailer] = useDisclosure(false);

  const heroMovie = popular.data?.results[0];

  return (
    <>
      {popular.isError && (
        <Container size="xl" pt="xl">
          <QueryError onRetry={() => popular.refetch()} />
        </Container>
      )}
      {popular.isPending && <Box h={HERO_HEIGHT} className="loading-skeleton" />}
      {heroMovie && <MovieHero movie={heroMovie} onPlayTrailer={trailer.open} />}

      <Container size="xl" py="xl">
        <Stack gap="xl">
          <RecommendationsRow />
          <RecentlyViewedRow />

          <div>
            {nowPlaying.isError ? (
              <QueryError onRetry={() => nowPlaying.refetch()} />
            ) : (
              <HorizontalMovieScroll
                title="Now Playing"
                icon={<Clapperboard size={18} />}
                movies={nowPlaying.data?.results ?? []}
                loading={nowPlaying.isPending}
              />
            )}
          </div>

          <div>
            <SectionTitle icon={<Trophy size={24} color="gold" />}>Top rated</SectionTitle>
            {topRated.isError ? (
              <QueryError onRetry={() => topRated.refetch()} />
            ) : (
              <MovieGrid
                movies={topRated.data?.results.slice(0, TOP_RATED_LIMIT) ?? []}
                loading={topRated.isPending}
              />
            )}
          </div>

          {genres.isError && <QueryError onRetry={() => genres.refetch()} />}
          {genres.data?.slice(0, GENRE_ROWS).map((genre) => (
            <GenreRow key={genre.id} genre={genre} />
          ))}
        </Stack>
      </Container>

      {heroMovie && (
        <TrailerModal
          opened={trailerOpened}
          onClose={trailer.close}
          movieId={heroMovie.id}
          movieTitle={heroMovie.title}
        />
      )}
    </>
  );
}
