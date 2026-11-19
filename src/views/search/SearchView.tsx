"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Container, Group, Stack, Text, Title, UnstyledButton } from "@mantine/core";
import { ArrowLeft } from "lucide-react";
import { useMovieSearch } from "@/entities/movie/hooks/useMovieSearch";
import { MovieGrid } from "@/features/movies/ui/MovieGrid/MovieGrid";
import { MovieSearchBox } from "@/features/search-movies/ui/MovieSearchBox/MovieSearchBox";
import { QueryError } from "@/shared/ui/QueryError/QueryError";

export function SearchView() {
  const router = useRouter();
  const query = useSearchParams().get("q") ?? "";
  // Any submitted query is searched, also short ones; the search box shares this cache
  const results = useMovieSearch(query, { minLength: 1 });

  return (
    <Container size="xl" py="md">
      <Stack gap="xl">
        <Group gap="md" hiddenFrom="sm">
          <UnstyledButton onClick={() => router.back()} aria-label="Back">
            <ArrowLeft size={24} color="white" />
          </UnstyledButton>
          <Text size="lg" fw={600} c="white">
            Search Movies
          </Text>
        </Group>

        {/* Keyed by the query so the input resets when the URL changes */}
        <MovieSearchBox
          key={query}
          placeholder="Search for movies..."
          initialQuery={query}
          variant="detailed"
          size="lg"
          autoFocus
        />

        {query && (
          <Title size="xl" fw={700} c="white" visibleFrom="sm">
            Search Results for &ldquo;{query}&rdquo;
          </Title>
        )}

        {query &&
          (results.isError ? (
            <QueryError onRetry={() => results.refetch()} />
          ) : results.isPending ? (
            <MovieGrid movies={[]} loading />
          ) : results.data.results.length > 0 ? (
            <MovieGrid movies={results.data.results} />
          ) : (
            <Text c="dimmed" ta="center" mt="xl">
              No movies found for &ldquo;{query}&rdquo;.
            </Text>
          ))}
      </Stack>
    </Container>
  );
}
