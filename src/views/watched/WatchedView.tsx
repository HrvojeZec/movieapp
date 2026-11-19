"use client";
import { Center, Container, Loader, SimpleGrid, Stack, Text } from "@mantine/core";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { useAuth } from "@/entities/user/hooks/useAuth";
import { ProtectedRoute } from "@/entities/user/ui/ProtectedRoute/ProtectedRoute";
import { GRID_COLUMNS } from "@/entities/movie/constants";
import { useMoviesByIds } from "@/entities/movie/hooks/useMoviesByIds";
import { ActionMovieCard } from "@/widgets/movie-collections/ui/ActionMovieCard/ActionMovieCard";
import { MovieGrid } from "@/widgets/movie-collections/ui/MovieGrid/MovieGrid";
import { watchedHistoryQuery } from "@/entities/watched/api/queries";
import { useInfiniteScroll } from "@/shared/hooks/useInfiniteScroll";
import { formatDate } from "@/shared/lib/format";
import { COLORS } from "@/shared/theme/colors";
import { Reveal } from "@/shared/ui/motion/Reveal";
import { QueryError } from "@/shared/ui/QueryError/QueryError";
import { SectionTitle } from "@/shared/ui/SectionTitle/SectionTitle";

export function WatchedView() {
  return (
    <ProtectedRoute>
      <Container size="xl" py="xl">
        <WatchedContent />
      </Container>
    </ProtectedRoute>
  );
}

function WatchedContent() {
  const { user } = useAuth();
  const history = useInfiniteQuery({
    ...watchedHistoryQuery(user?.id ?? ""),
    enabled: Boolean(user),
  });
  const entries = history.data?.pages.flatMap((page) => page.results) ?? [];
  const total = history.data?.pages[0]?.total ?? 0;
  const { movies, isPending, isError, refetch } = useMoviesByIds(
    entries.map((entry) => Number(entry.movieId)),
  );
  const moviesById = new Map(movies.map((movie) => [String(movie.id), movie]));

  const sentinelRef = useInfiniteScroll({
    hasNextPage: history.hasNextPage,
    isFetchingNextPage: history.isFetchingNextPage,
    fetchNextPage: history.fetchNextPage,
  });

  return (
    <Stack gap="xl">
      <SectionTitle icon={<Eye color={COLORS.primary} size={28} />} order={1} size="2rem">
        Watched ({total})
      </SectionTitle>

      {(history.isError || isError) && (
        <QueryError
          message="Some movies couldn't be loaded."
          onRetry={() => (history.isError ? history.refetch() : refetch())}
        />
      )}

      {history.isPending || (isPending && movies.length === 0) ? (
        <MovieGrid movies={[]} loading />
      ) : entries.length > 0 ? (
        <SimpleGrid cols={GRID_COLUMNS} spacing="lg">
          {entries.map((entry, index) => {
            const movie = moviesById.get(entry.movieId);
            if (!movie) return null;
            return (
              <Reveal key={entry.movieId} index={index}>
                <Stack gap={6}>
                  <ActionMovieCard movie={movie} />
                  <Text size="xs" c="dimmed" ta="center">
                    Watched {formatDate(entry.watchedAt)}
                  </Text>
                </Stack>
              </Reveal>
            );
          })}
        </SimpleGrid>
      ) : (
        !history.isError && (
          <Text c="dimmed" ta="center" size="lg" mt="xl">
            You haven&apos;t marked any movies as watched yet. Use the eye on a movie to keep track
            of what you&apos;ve seen.
          </Text>
        )
      )}

      <div ref={sentinelRef} />
      {history.isFetchingNextPage && (
        <Center>
          <Loader size="sm" />
        </Center>
      )}
    </Stack>
  );
}
