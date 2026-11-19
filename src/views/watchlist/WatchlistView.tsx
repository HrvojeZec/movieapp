"use client";
import { Container, Stack, Text } from "@mantine/core";
import { Bookmark } from "lucide-react";
import { useAuth } from "@/entities/user/hooks/useAuth";
import { ProtectedRoute } from "@/entities/user/ui/ProtectedRoute/ProtectedRoute";
import { useMoviesByIds } from "@/entities/movie/hooks/useMoviesByIds";
import { MovieGrid } from "@/features/movies/ui/MovieGrid/MovieGrid";
import { useToggleWatchlist } from "@/features/toggle-watchlist/hooks/useToggleWatchlist";
import { LockedFeature } from "@/entities/user/ui/LockedFeature/LockedFeature";
import { COLORS } from "@/shared/theme/colors";
import { QueryError } from "@/shared/ui/QueryError/QueryError";
import { SectionTitle } from "@/shared/ui/SectionTitle/SectionTitle";
import { SwipeToRemove } from "@/shared/ui/SwipeToRemove/SwipeToRemove";
import { showUndoNotice } from "@/shared/ui/SwipeToRemove/undo-notice";

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
  const toggle = useToggleWatchlist();
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
        <MovieGrid
          movies={movies}
          renderCard={(movie, card) => (
            <SwipeToRemove
              label="Remove"
              onRemove={() => {
                toggle(String(movie.id));
                // Toggling again puts it back; this page is only open to plans with a watchlist
                showUndoNotice({
                  title: "Removed from your watchlist",
                  message: movie.title,
                  onUndo: () => toggle(String(movie.id)),
                });
              }}
            >
              {card}
            </SwipeToRemove>
          )}
        />
      ) : (
        <Text c="dimmed" ta="center" size="lg" mt="xl">
          Nothing on your watchlist yet. Use the bookmark on a movie to save it for later.
        </Text>
      )}
    </Stack>
  );
}
