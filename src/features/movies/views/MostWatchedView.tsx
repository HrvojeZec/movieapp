"use client";
import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container, Group, Select, NumberInput, Stack, Text, Loader, Center } from "@mantine/core";
import { useIntersection } from "@mantine/hooks";
import { Flame } from "lucide-react";
import type { DiscoverFilters, Movie } from "@/features/movies/api";
import { useGenres, useInfiniteDiscoverMovies } from "@/features/movies/queries";
import { MovieGrid } from "@/features/movies/components/MovieGrid";
import { QueryError } from "@/shared/components/QueryError";

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 30 }, (_, i) => ({
  value: (currentYear - i).toString(),
  label: (currentYear - i).toString(),
}));

function toNumber(value: string | null): number | undefined {
  const parsed = value === null ? NaN : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

type FilterKey = "year" | "genre" | "rating";

export function MostWatchedView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // The URL is the single source of truth for filters, so they survive reloads and can be shared
  const year = searchParams.get("year");
  const genre = searchParams.get("genre");
  const rating = searchParams.get("rating");
  const filters = useMemo<DiscoverFilters>(
    () => ({ year: toNumber(year), genre: toNumber(genre), minRating: toNumber(rating) }),
    [year, genre, rating],
  );

  const genres = useGenres();
  const { data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteDiscoverMovies(filters);

  // TMDB can return the same movie on two pages when popularity shifts between requests
  const movies = useMemo(() => {
    const unique = new Map<number, Movie>();
    data?.pages.forEach((page) => page.results.forEach((movie) => unique.set(movie.id, movie)));
    return [...unique.values()];
  }, [data]);

  const { ref: sentinelRef, entry } = useIntersection<HTMLDivElement>({ rootMargin: "600px" });
  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [entry?.isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const setFilter = (key: FilterKey, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    const query = params.toString();
    router.replace(query ? `/most-watched?${query}` : "/most-watched", { scroll: false });
  };

  const genreOptions = (genres.data ?? []).map((item) => ({
    value: item.id.toString(),
    label: item.name,
  }));

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group gap="sm">
          <Flame color="red" size={30} />
          <Text c="white" size="xl">
            Most Watched
          </Text>
        </Group>

        <Group gap="md" wrap="wrap" data-aos="fade-up" data-aos-delay="200">
          <Select
            placeholder="Release Year"
            data={yearOptions}
            value={year}
            onChange={(value) => setFilter("year", value)}
            clearable
            w={150}
            styles={{
              input: { backgroundColor: "rgba(255, 255, 255, 0.05)" },
              dropdown: { backgroundColor: "var(--gray-800)" },
            }}
          />

          <Select
            placeholder="Genre"
            data={genreOptions}
            value={genre}
            onChange={(value) => setFilter("genre", value)}
            clearable
            w={200}
            styles={{
              input: { backgroundColor: "rgba(255, 255, 255, 0.05)" },
              dropdown: { backgroundColor: "var(--gray-800)" },
            }}
          />

          <NumberInput
            placeholder="Min Rating"
            min={0}
            max={10}
            step={0.1}
            value={rating ?? ""}
            onChange={(value) => setFilter("rating", value === "" ? null : String(value))}
            w={150}
            styles={{
              input: { backgroundColor: "rgba(255, 255, 255, 0.05)" },
            }}
          />
        </Group>

        {isError ? (
          <QueryError onRetry={() => refetch()} />
        ) : isPending ? (
          <MovieGrid movies={[]} loading />
        ) : movies.length === 0 ? (
          <Center h={200}>
            <Text c="dimmed">No movies match these filters.</Text>
          </Center>
        ) : (
          <div data-aos="fade-up" data-aos-delay="400">
            <MovieGrid movies={movies} />
          </div>
        )}

        <div ref={sentinelRef} aria-hidden />
        {isFetchingNextPage && (
          <Center>
            <Loader size="md" />
          </Center>
        )}
        {!isPending && !hasNextPage && movies.length > 0 && (
          <Center>
            <Text c="dimmed">No more movies to load</Text>
          </Center>
        )}
      </Stack>
    </Container>
  );
}
