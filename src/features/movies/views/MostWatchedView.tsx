"use client";
import { useMemo } from "react";
import { Center, Group, Loader, NumberInput, Select, Stack, Text, Container } from "@mantine/core";
import { Flame } from "lucide-react";
import {
  FILTER_WIDTHS,
  INFINITE_SCROLL_MARGIN,
  MAX_RATING,
  YEAR_OPTIONS_COUNT,
} from "@/features/movies/constants";
import { useDiscoverFilters } from "@/features/movies/hooks/useDiscoverFilters";
import { useGenres } from "@/features/movies/hooks/useGenres";
import { useInfiniteDiscoverMovies } from "@/features/movies/hooks/useInfiniteDiscoverMovies";
import { buildYearOptions } from "@/features/movies/lib/filters";
import { dedupeMovies } from "@/features/movies/lib/movies";
import { MovieGrid } from "@/features/movies/ui/MovieGrid/MovieGrid";
import { useInfiniteScroll } from "@/shared/hooks/useInfiniteScroll";
import { QueryError } from "@/shared/ui/QueryError/QueryError";
import { SectionTitle } from "@/shared/ui/SectionTitle/SectionTitle";
import classes from "./MostWatchedView.module.scss";

const yearOptions = buildYearOptions(new Date().getFullYear() + 1, YEAR_OPTIONS_COUNT);
const RATING_STEP = 0.1;
const EMPTY_STATE_HEIGHT = 200;
const filterClassNames = { input: classes.filterInput, dropdown: classes.filterDropdown };

export function MostWatchedView() {
  const { filters, values, setFilter } = useDiscoverFilters();
  const genres = useGenres();
  const { data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteDiscoverMovies(filters);

  const movies = useMemo(() => dedupeMovies(data?.pages ?? []), [data]);
  const sentinelRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    rootMargin: INFINITE_SCROLL_MARGIN,
  });

  const genreOptions = (genres.data ?? []).map((item) => ({
    value: item.id.toString(),
    label: item.name,
  }));

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <SectionTitle icon={<Flame color="red" size={28} />} order={1} size="2rem">
          Most Watched
        </SectionTitle>

        <Group gap="md" wrap="wrap">
          <Select
            placeholder="Release Year"
            data={yearOptions}
            value={values.year}
            onChange={(value) => setFilter("year", value)}
            clearable
            w={FILTER_WIDTHS.year}
            classNames={filterClassNames}
          />

          <Select
            placeholder="Genre"
            data={genreOptions}
            value={values.genre}
            onChange={(value) => setFilter("genre", value)}
            clearable
            w={FILTER_WIDTHS.genre}
            classNames={filterClassNames}
          />

          <NumberInput
            placeholder="Min Rating"
            min={0}
            max={MAX_RATING}
            step={RATING_STEP}
            value={values.minRating ?? ""}
            onChange={(value) => setFilter("minRating", value === "" ? null : String(value))}
            w={FILTER_WIDTHS.rating}
            classNames={{ input: classes.filterInput }}
          />
        </Group>

        {isError ? (
          <QueryError onRetry={() => refetch()} />
        ) : isPending ? (
          <MovieGrid movies={[]} loading />
        ) : movies.length === 0 ? (
          <Center h={EMPTY_STATE_HEIGHT}>
            <Text c="dimmed">No movies match these filters.</Text>
          </Center>
        ) : (
          <MovieGrid movies={movies} />
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
