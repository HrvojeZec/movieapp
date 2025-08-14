"use client";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
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
import { Search, ArrowLeft } from "lucide-react";
import { searchMovies, Movie } from "@/lib/external/tmdb";
import { MovieGrid } from "@/components/Movies/MovieGrid";
import { getImageUrl } from "@/lib/external/tmdb";
import { useRouter } from "next/navigation";
import { formatYear } from "@/utils";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const router = useRouter();

  const [query, setQuery] = useState(initialQuery);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (initialQuery.trim()) {
        try {
          setLoading(true);
          const results = await searchMovies(initialQuery);
          setMovies(results.results);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSearchResults();
  }, [initialQuery]);

  const handleSearch = async (searchQuery: string) => {
    if (searchQuery.length > 2) {
      try {
        const results = await searchMovies(searchQuery);
        setSearchResults(results.results.slice(0, 8));
        setShowResults(true);
      } catch (error) {
        console.error("Search failed:", error);
      }
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const debouncedSearch = (searchQuery: string) => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => handleSearch(searchQuery), 500);
  };

  const handleSearchChange = (value: string) => {
    setQuery(value);
    debouncedSearch(value);
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

          {showResults && searchResults.length > 0 && (
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
                {searchResults.map((movie) => (
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
                      <img
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
                          {formatYear(movie.release_date)} • ★{" "}
                          {movie.vote_average.toFixed(1)}
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
            Search Results for "{initialQuery}"
          </Title>
        )}

        {initialQuery &&
          (loading ? (
            <MovieGrid movies={[]} loading={true} />
          ) : movies.length > 0 ? (
            <MovieGrid movies={movies} />
          ) : (
            <Text c="dimmed" ta="center" mt="xl">
              No movies found for "{initialQuery}".
            </Text>
          ))}
      </Stack>
    </Container>
  );
}
