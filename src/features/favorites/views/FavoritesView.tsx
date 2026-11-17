"use client";
import { Container, Title, Text, Stack, Button, Group } from "@mantine/core";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { MovieGrid } from "@/features/movies/components/MovieGrid";
import { useMoviesByIds } from "@/features/movies/queries";
import { QueryError } from "@/shared/components/QueryError";

export function FavoritesView() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const favoriteIds = (user?.favorites ?? []).map(Number);
  const { movies: favoriteMovies, isPending, isError, refetch } = useMoviesByIds(favoriteIds);
  // Removing a favorite keeps the remaining cards visible instead of flashing a skeleton
  const loading = authLoading || (isPending && favoriteMovies.length === 0);

  const totalFavorites = user?.favorites?.length || 0;

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group gap={8} align="center">
          <Heart color="red"></Heart>
          <Title size="2rem" fw={700} c="white" data-aos="fade-down">
            My Favorites ({totalFavorites})
          </Title>
        </Group>

        {isError && <QueryError message="Some favorites couldn't be loaded." onRetry={refetch} />}

        {loading ? (
          <MovieGrid movies={[]} loading={true} />
        ) : favoriteMovies.length > 0 ? (
          <div data-aos="fade-up" data-aos-delay="200">
            <MovieGrid movies={favoriteMovies} />
          </div>
        ) : (
          <div data-aos="fade-up" data-aos-delay="200">
            <Text c="dimmed" ta="center" mt="xl" size="lg">
              {user
                ? "You haven't added any movies to your favorites yet."
                : "Please log in to view your favorites."}
            </Text>
            {!user && (
              <Text c="dimmed" ta="center" mt="md" size="sm">
                <Button variant="outline" onClick={() => router.push("/auth/login")}>
                  Log In
                </Button>
              </Text>
            )}
          </div>
        )}
      </Stack>
    </Container>
  );
}
