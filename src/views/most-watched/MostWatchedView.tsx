"use client";
import { useMemo } from "react";
import {
  Button,
  Center,
  Collapse,
  Container,
  Group,
  Loader,
  NumberInput,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Flame, FunnelX, Lock, SlidersHorizontal } from "lucide-react";
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
import { AdvancedFilters } from "@/features/movies/ui/AdvancedFilters/AdvancedFilters";
import { MovieGrid } from "@/features/movies/ui/MovieGrid/MovieGrid";
import { useEntitlements } from "@/features/subscription/hooks/useEntitlements";
import { LockedFeature } from "@/features/subscription/ui/LockedFeature/LockedFeature";
import { useInfiniteScroll } from "@/shared/hooks/useInfiniteScroll";
import { QueryError } from "@/shared/ui/QueryError/QueryError";
import { SectionTitle } from "@/shared/ui/SectionTitle/SectionTitle";
import classes from "./MostWatchedView.module.scss";

const yearOptions = buildYearOptions(new Date().getFullYear() + 1, YEAR_OPTIONS_COUNT);
const RATING_STEP = 0.1;
const EMPTY_STATE_HEIGHT = 200;
const filterClassNames = { input: classes.filterInput, dropdown: classes.filterDropdown };

export function MostWatchedView() {
  const {
    filters,
    advanced,
    values,
    advancedValues,
    hasFilters,
    hasAdvanced,
    setFilter,
    setAdvancedFilter,
    clearFilters,
  } = useDiscoverFilters();
  const { can } = useEntitlements();
  const canFilterMore = can("advancedFilters");
  const [advancedOpened, advancedPanel] = useDisclosure(hasAdvanced);
  const genres = useGenres();
  // Advanced filters in a shared link are ignored for plans without them
  const { data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteDiscoverMovies(filters, canFilterMore && hasAdvanced ? advanced : null);

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

          <Button
            variant={advancedOpened ? "light" : "default"}
            leftSection={canFilterMore ? <SlidersHorizontal size={16} /> : <Lock size={16} />}
            onClick={advancedPanel.toggle}
            aria-expanded={advancedOpened}
          >
            Advanced filters
          </Button>

          {hasFilters && (
            <Button
              variant="subtle"
              color="gray"
              leftSection={<FunnelX size={16} />}
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          )}
        </Group>

        <Collapse expanded={advancedOpened}>
          <LockedFeature feature="advancedFilters" title="Advanced filters">
            <AdvancedFilters
              values={advancedValues}
              genreOptions={genreOptions}
              onChange={setAdvancedFilter}
            />
          </LockedFeature>
        </Collapse>

        {isError ? (
          <QueryError onRetry={() => refetch()} />
        ) : isPending ? (
          <MovieGrid movies={[]} loading />
        ) : movies.length === 0 ? (
          <Stack h={EMPTY_STATE_HEIGHT} align="center" justify="center" gap="md">
            <Text c="dimmed">No movies match these filters.</Text>
            {hasFilters && (
              <Button variant="light" leftSection={<FunnelX size={16} />} onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </Stack>
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
