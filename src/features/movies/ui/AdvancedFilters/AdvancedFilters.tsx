"use client";
import { Group, MultiSelect, Select } from "@mantine/core";
import {
  ADVANCED_YEAR_OPTIONS_COUNT,
  LANGUAGE_OPTIONS,
  MAX_GENRE_FILTERS,
  MIN_VOTES_OPTIONS,
  RUNTIME_OPTIONS,
  SORT_OPTIONS,
} from "@/features/movies/constants";
import type { AdvancedFilterKey } from "@/features/movies/hooks/useDiscoverFilters";
import { buildYearOptions } from "@/features/movies/lib/filters";
import classes from "./AdvancedFilters.module.scss";

const yearOptions = buildYearOptions(new Date().getFullYear() + 1, ADVANCED_YEAR_OPTIONS_COUNT);
// The chosen value is all an input shows, so it says which end of the range it is
const fromYearOptions = yearOptions.map(({ value }) => ({ value, label: `From ${value}` }));
const toYearOptions = yearOptions.map(({ value }) => ({ value, label: `To ${value}` }));
const toOptions = (values: number[], label: (value: number) => string) =>
  values.map((value) => ({ value: String(value), label: label(value) }));
const runtimeMinOptions = toOptions(RUNTIME_OPTIONS, (minutes) => `At least ${minutes} min`);
const runtimeMaxOptions = toOptions(RUNTIME_OPTIONS, (minutes) => `Up to ${minutes} min`);
const minVotesOptions = toOptions(
  MIN_VOTES_OPTIONS,
  (votes) => `${votes.toLocaleString("en-US")}+ votes`,
);
const selectClassNames = { input: classes.input, dropdown: classes.dropdown };

// A range's ends limit each other, so the inputs can never send "from 2000 to 1990"
const atMost = (limit: string | null) => (option: { value: string }) =>
  limit === null || Number(option.value) <= Number(limit);
const atLeast = (limit: string | null) => (option: { value: string }) =>
  limit === null || Number(option.value) >= Number(limit);

interface AdvancedFiltersProps {
  values: Record<AdvancedFilterKey, string | null>;
  genreOptions: { value: string; label: string }[];
  onChange: (key: AdvancedFilterKey, value: string | null) => void;
}

/** The Premium discover filters; every input picks from a list, so half-typed values never go out. */
export function AdvancedFilters({ values, genreOptions, onChange }: AdvancedFiltersProps) {
  const select = (key: AdvancedFilterKey, placeholder: string) => ({
    placeholder,
    "aria-label": placeholder,
    value: values[key],
    onChange: (value: string | null) => onChange(key, value),
    clearable: true,
    classNames: selectClassNames,
  });

  return (
    <Group gap="md" wrap="wrap" className={classes.filters}>
      <Select
        {...select("yearFrom", "From year")}
        data={fromYearOptions.filter(atMost(values.yearTo))}
        searchable
        className={classes.short}
      />
      <Select
        {...select("yearTo", "To year")}
        data={toYearOptions.filter(atLeast(values.yearFrom))}
        searchable
        className={classes.short}
      />
      <MultiSelect
        placeholder={values.genres ? undefined : "All of these genres"}
        aria-label="All of these genres"
        data={genreOptions}
        value={values.genres ? values.genres.split(",") : []}
        onChange={(genres) => onChange("genres", genres.length > 0 ? genres.join(",") : null)}
        maxValues={MAX_GENRE_FILTERS}
        clearable
        searchable
        classNames={selectClassNames}
        className={classes.wide}
      />
      <Select
        {...select("runtimeMin", "Min runtime")}
        data={runtimeMinOptions.filter(atMost(values.runtimeMax))}
        className={classes.medium}
      />
      <Select
        {...select("runtimeMax", "Max runtime")}
        data={runtimeMaxOptions.filter(atLeast(values.runtimeMin))}
        className={classes.medium}
      />
      <Select
        {...select("language", "Original language")}
        data={LANGUAGE_OPTIONS}
        searchable
        className={classes.medium}
      />
      <Select {...select("sortBy", "Sort by")} data={SORT_OPTIONS} className={classes.medium} />
      <Select
        {...select("minVotes", "Min votes")}
        data={minVotesOptions}
        className={classes.medium}
      />
    </Group>
  );
}
