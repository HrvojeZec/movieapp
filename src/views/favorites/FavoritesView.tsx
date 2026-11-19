"use client";
import { Button, Center, Container, Group, Progress, Stack, Text } from "@mantine/core";
import { useAppRouter } from "@/shared/hooks/useAppRouter";
import { Heart } from "lucide-react";
import { useAuth } from "@/entities/user/hooks/useAuth";
import { useEntitlements } from "@/entities/user/hooks/useEntitlements";
import { useMoviesByIds } from "@/entities/movie/hooks/useMoviesByIds";
import { MovieGrid } from "@/features/movies/ui/MovieGrid/MovieGrid";
import { ROUTES } from "@/shared/routes";
import { LinkButton } from "@/shared/ui/LinkButton/LinkButton";
import { QueryError } from "@/shared/ui/QueryError/QueryError";
import { SectionTitle } from "@/shared/ui/SectionTitle/SectionTitle";
import { Reveal } from "@/shared/ui/motion/Reveal";

export function FavoritesView() {
  const { user, loading: authLoading } = useAuth();
  const router = useAppRouter();
  const { favoritesLimit } = useEntitlements();
  const favorites = user?.favorites ?? [];
  const { movies, isPending, isError, refetch } = useMoviesByIds(favorites.map(Number));
  // Removing a favorite keeps the remaining cards visible instead of flashing a skeleton
  const loading = authLoading || (isPending && movies.length === 0);

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="center" gap="md">
          <SectionTitle icon={<Heart color="red" size={28} />} order={1} size="2rem">
            My Favorites ({favorites.length})
          </SectionTitle>
          {user && favoritesLimit !== null && (
            <FavoritesQuota count={favorites.length} limit={favoritesLimit} />
          )}
        </Group>

        {isError && <QueryError message="Some favorites couldn't be loaded." onRetry={refetch} />}

        {loading ? (
          <MovieGrid movies={[]} loading />
        ) : movies.length > 0 ? (
          <MovieGrid movies={movies} />
        ) : (
          <Reveal>
            <Stack gap="md" mt="xl">
              <Text c="dimmed" ta="center" size="lg">
                {user
                  ? "You haven't added any movies to your favorites yet."
                  : "Please log in to view your favorites."}
              </Text>
              {!user && (
                <Center>
                  <Button variant="outline" onClick={() => router.push(ROUTES.login)}>
                    Log In
                  </Button>
                </Center>
              )}
            </Stack>
          </Reveal>
        )}
      </Stack>
    </Container>
  );
}

/** How much of the free plan's favorites limit is used, with a way to lift it once full. */
function FavoritesQuota({ count, limit }: { count: number; limit: number }) {
  const full = count >= limit;
  return (
    <Stack gap={6} miw={220}>
      <Group justify="space-between" gap="sm">
        <Text size="sm" c={full ? "orange.4" : "dimmed"}>
          {count} / {limit} on the free plan
        </Text>
        {full && (
          <LinkButton href={ROUTES.pricing} size="compact-xs" variant="light">
            Get unlimited
          </LinkButton>
        )}
      </Group>
      <Progress
        value={Math.min(100, (count / limit) * 100)}
        color={full ? "orange" : "blue"}
        size="sm"
        aria-label="Favorites used"
      />
    </Stack>
  );
}
