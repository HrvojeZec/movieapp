"use client";
import { Alert, Container, SimpleGrid, Stack, Text } from "@mantine/core";
import { Info, Sparkles } from "lucide-react";
import { ProtectedRoute } from "@/entities/user/ui/ProtectedRoute/ProtectedRoute";
import { GRID_COLUMNS } from "@/entities/movie/constants";
import { ActionMovieCard } from "@/widgets/movie-collections/ui/ActionMovieCard/ActionMovieCard";
import { MovieGrid } from "@/widgets/movie-collections/ui/MovieGrid/MovieGrid";
import { useRecommendations } from "@/entities/recommendation/hooks/useRecommendations";
import { LockedFeature } from "@/entities/user/ui/LockedFeature/LockedFeature";
import { COLORS } from "@/shared/theme/colors";
import { Reveal } from "@/shared/ui/motion/Reveal";
import { QueryError } from "@/shared/ui/QueryError/QueryError";
import { SectionTitle } from "@/shared/ui/SectionTitle/SectionTitle";

export function RecommendationsView() {
  return (
    <ProtectedRoute>
      <Container size="xl" py="xl">
        <LockedFeature feature="recommendations" title="Recommendations">
          <RecommendationsContent />
        </LockedFeature>
      </Container>
    </ProtectedRoute>
  );
}

function RecommendationsContent() {
  const { data, isPending, isError, refetch } = useRecommendations();

  return (
    <Stack gap="xl">
      <SectionTitle icon={<Sparkles color={COLORS.primary} size={28} />} order={1} size="2rem">
        Recommended for you
      </SectionTitle>

      {data?.coldStart && (
        <Alert icon={<Info size={18} />} color="blue" variant="light">
          Add favorites or mark movies as watched to get recommendations. Until then, here&apos;s
          what&apos;s popular.
        </Alert>
      )}

      {isError ? (
        <QueryError message="Recommendations couldn't be loaded." onRetry={refetch} />
      ) : isPending ? (
        <MovieGrid movies={[]} loading />
      ) : data.results.length === 0 ? (
        <Text c="dimmed" ta="center" size="lg" mt="xl">
          Nothing new to recommend right now. Try again after adding a few more favorites.
        </Text>
      ) : (
        <SimpleGrid cols={GRID_COLUMNS} spacing="lg">
          {data.results.map((movie, index) => (
            <Reveal key={movie.id} index={index}>
              <Stack gap={6}>
                <ActionMovieCard movie={movie} />
                <Text size="xs" c="dimmed" ta="center" lineClamp={2}>
                  {movie.reason}
                </Text>
              </Stack>
            </Reveal>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}
