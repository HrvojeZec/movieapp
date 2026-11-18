"use client";
import { Container, Stack, Text } from "@mantine/core";
import { Bookmark } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ProtectedRoute } from "@/features/auth/ui/ProtectedRoute/ProtectedRoute";
import { useMoviesByIds } from "@/features/movies/hooks/useMoviesByIds";
import { MovieGrid } from "@/features/movies/ui/MovieGrid/MovieGrid";
import { LockedFeature } from "@/features/subscription/ui/LockedFeature/LockedFeature";
import { COLORS } from "@/shared/theme/colors";
import { QueryError } from "@/shared/ui/QueryError/QueryError";
import { SectionTitle } from "@/shared/ui/SectionTitle/SectionTitle";

export function WatchlistView() {
  return (
    <ProtectedRoute>
      <Container size="xl" py="xl">
        <Stack gap="xl">
          <LockedFeature feature="watchlist" title="Your watchlist">
            <WatchlistContent />
          </LockedFeature>
        </Stack>
      </Container>
    </ProtectedRoute>
  );
}

function WatchlistContent() {
  const { user } = useAuth();
  const watchlist = user?.watchlist ?? [];
  // Newest first: the movie saved last is usually the one to watch next
  const { movies, isPending, isError, refetch } = useMoviesByIds(
    [...watchlist].reverse().map(Number),
  );

  return (
    <Stack gap="xl">
      <SectionTitle icon={<Bookmark color={COLORS.success} size={28} />} order={1} size="2rem">
        My Watchlist ({watchlist.length})
      </SectionTitle>

      {isError && <QueryError message="Some movies couldn't be loaded." onRetry={refetch} />}

      {isPending && movies.length === 0 && watchlist.length > 0 ? (
        <MovieGrid movies={[]} loading />
      ) : movies.length > 0 ? (
        <MovieGrid movies={movies} />
      ) : (
        <Text c="dimmed" ta="center" size="lg" mt="xl">
          Nothing on your watchlist yet. Use the bookmark on a movie to save it for later.
        </Text>
      )}
    </Stack>
  );
}
