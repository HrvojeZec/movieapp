"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Container,
  Title,
  Text,
  Stack,
  TextInput,
  Box,
  UnstyledButton,
  Group,
  ScrollArea,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { Search, ArrowLeft } from "lucide-react";
import { getImageUrl } from "@/features/movies/lib/images";
import { useMovieSearch } from "@/features/movies/hooks/useMovieSearch";
import { MovieGrid } from "@/features/movies/ui/MovieGrid/MovieGrid";
import { QueryError } from "@/shared/ui/QueryError/QueryError";
import { formatYear } from "@/shared/lib/format";

const SUGGESTION_LIMIT = 8;

export function SearchView() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const router = useRouter();

  const [query, setQuery] = useState(initialQuery);
  const [showResults, setShowResults] = useState(false);
  const [debouncedQuery] = useDebouncedValue(query, 400);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Both use the same cache, so typing the submitted query again doesn't refetch
  const results = useMovieSearch(initialQuery, { minLength: 1 });
  const suggestions = useMovieSearch(debouncedQuery);
  const suggestionList = suggestions.data?.results.slice(0, SUGGESTION_LIMIT) ?? [];

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const handleSearchChange = (value: string) => {
    setQuery(value);
    setShowResults(value.trim().length > 2);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setShowResults(false);
    }
  };

  const handleMovieSelect = (movieId: number) => {
    router.push(`/movie/${movieId}`);
  };

  return (
    <Container size="xl" py="md">
      <Stack gap="xl">
        <Group gap="md" hiddenFrom="sm">
          <UnstyledButton onClick={() => router.back()}>
            <ArrowLeft size={24} color="white" />
          </UnstyledButton>
          <Text size="lg" fw={600} c="white">
            Search Movies
          </Text>
        </Group>

        <Box pos="relative">
          <form onSubmit={handleSearchSubmit}>
            <TextInput
              ref={searchInputRef}
              placeholder="Search for movies..."
              leftSection={<Search size={18} />}
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              size="lg"
              styles={{
                input: {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "white",
                  "&::placeholder": { color: "rgba(255, 255, 255, 0.6)" },
                },
              }}
            />
          </form>

          {showResults && suggestionList.length > 0 && (
            <Box
              pos="absolute"
              top="100%"
              left={0}
              right={0}
              bg="dark.7"
              style={{
                border: "1px solid rgba(59, 130, 246, 0.3)",
                borderRadius: 8,
                zIndex: 1000,
                marginTop: 4,
              }}
              mah={400}
            >
              <ScrollArea mah={400}>
                {suggestionList.map((movie) => (
                  <UnstyledButton
                    key={movie.id}
                    w="100%"
                    p="md"
                    onClick={() => handleMovieSelect(movie.id)}
                    style={{
                      borderRadius: 4,
                      "&:hover": {
                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                      },
                    }}
                  >
                    <Group gap="md">
                      <Image
                        src={getImageUrl(movie.poster_path, "w200")}
                        alt={movie.title}
                        width={50}
                        height={75}
                        style={{ borderRadius: 4, flexShrink: 0 }}
                      />
                      <Box>
                        <Text size="sm" c="white" fw={500} lineClamp={1}>
                          {movie.title}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {formatYear(movie.release_date)} • ★ {movie.vote_average.toFixed(1)}
                        </Text>
                        <Text size="xs" c="gray.5" lineClamp={2} mt={4}>
                          {movie.overview}
                        </Text>
                      </Box>
                    </Group>
                  </UnstyledButton>
                ))}
              </ScrollArea>
            </Box>
          )}
        </Box>

        {initialQuery && (
          <Title size="xl" fw={700} c="white" visibleFrom="sm">
            Search Results for &ldquo;{initialQuery}&rdquo;
          </Title>
        )}

        {initialQuery &&
          (results.isError ? (
            <QueryError onRetry={() => results.refetch()} />
          ) : results.isPending ? (
            <MovieGrid movies={[]} loading={true} />
          ) : results.data.results.length > 0 ? (
            <MovieGrid movies={results.data.results} />
          ) : (
            <Text c="dimmed" ta="center" mt="xl">
              No movies found for &ldquo;{initialQuery}&rdquo;.
            </Text>
          ))}
      </Stack>
    </Container>
  );
}
