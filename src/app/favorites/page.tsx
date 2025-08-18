"use client";
import { Container, Title, Text, Stack, Button, Group } from "@mantine/core";
import { useAuth } from "@/contexts/AuthContext";
import { MovieGrid } from "@/components/Movies/MovieGrid";
import { useEffect, useState } from "react";
import { getMovieDetails, MovieDetails } from "@/lib/external/tmdb";
import { useRouter } from "next/navigation"; // Ispravan uvoz
import { Heart } from "lucide-react";

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favoriteMovies, setFavoriteMovies] = useState<MovieDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const fetchFavoriteMovies = async () => {
      setLoading(true);

      try {
        const movieIds = user?.favorites || [];

        if (movieIds.length === 0) {
          setFavoriteMovies([]);
          setLoading(false);
          return;
        }

        const moviePromises = movieIds.map(async (movieId) => {
          try {
            return await getMovieDetails(parseInt(movieId));
          } catch (error) {
            console.error(`Failed to fetch movie ${movieId}:`, error);
            return null;
          }
        });

        const movies = await Promise.all(moviePromises);
        setFavoriteMovies(movies.filter(Boolean) as MovieDetails[]);
      } catch (error) {
        console.error("Failed to fetch favorite movies:", error);
        setFavoriteMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteMovies();
  }, [user]);

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
                <Button
                  variant="outline"
                  onClick={() => router.push("/auth/login")}
                >
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
