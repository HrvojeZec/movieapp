"use client";
import { Button, Center, Container, Stack, Text } from "@mantine/core";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useMoviesByIds } from "@/features/movies/hooks/useMoviesByIds";
import { MovieGrid } from "@/features/movies/ui/MovieGrid/MovieGrid";
import { ROUTES } from "@/shared/routes";
import { QueryError } from "@/shared/ui/QueryError/QueryError";
import { SectionTitle } from "@/shared/ui/SectionTitle/SectionTitle";
import { Reveal } from "@/shared/ui/motion/Reveal";

export function FavoritesView() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const favorites = user?.favorites ?? [];
  const { movies, isPending, isError, refetch } = useMoviesByIds(favorites.map(Number));
  // Removing a favorite keeps the remaining cards visible instead of flashing a skeleton
  const loading = authLoading || (isPending && movies.length === 0);

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <SectionTitle icon={<Heart color="red" size={28} />} order={1} size="2rem">
          My Favorites ({favorites.length})
        </SectionTitle>

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
