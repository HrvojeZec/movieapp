import { useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedValue } from "@mantine/hooks";
import {
  SEARCH_DEBOUNCE_MS,
  SEARCH_SUGGESTION_LIMIT,
  SEARCH_SUGGESTION_MIN_LENGTH,
} from "@/features/movies/constants";
import { useMovieSearch } from "@/features/movies/hooks/useMovieSearch";
import type { Movie, MovieSummary } from "@/features/movies/types";
import { ROUTES } from "@/shared/routes";

interface SearchSuggestionsOptions {
  initialQuery?: string;
  /** Empty the input after navigating (navbar), or keep the query visible (search page). */
  clearOnSubmit?: boolean;
  /** Shown while nothing is typed, e.g. recently viewed movies in the command palette. */
  emptyResults?: MovieSummary[];
}

const NO_MOVIES: MovieSummary[] = [];

/** State and keyboard handling for a search box with a suggestion dropdown. */
export function useSearchSuggestions({
  initialQuery = "",
  clearOnSubmit = false,
  emptyResults = NO_MOVIES,
}: SearchSuggestionsOptions = {}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [debouncedQuery] = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  const { data, isFetching } = useMovieSearch(debouncedQuery, {
    minLength: SEARCH_SUGGESTION_MIN_LENGTH,
  });
  const searchable = query.trim().length >= SEARCH_SUGGESTION_MIN_LENGTH;
  // Results for the current text are still on their way (debounce or request)
  const pending = searchable && (query !== debouncedQuery || isFetching);
  const searchResults: Movie[] = data?.results.slice(0, SEARCH_SUGGESTION_LIMIT) ?? [];
  const suggestions: (MovieSummary & Partial<Pick<Movie, "overview">>)[] = query.trim()
    ? searchResults
    : emptyResults;

  const close = () => {
    setOpen(false);
    setActiveIndex(-1);
  };

  const finish = () => {
    close();
    if (clearOnSubmit) setQuery("");
  };

  const changeQuery = (value: string) => {
    setQuery(value);
    setActiveIndex(-1);
    setOpen(value.trim().length >= SEARCH_SUGGESTION_MIN_LENGTH);
  };

  const selectMovie = (movie: MovieSummary) => {
    router.push(ROUTES.movie(movie.id));
    finish();
  };

  const submit = () => {
    const active = suggestions[activeIndex];
    if (active) {
      selectMovie(active);
    } else if (query.trim()) {
      router.push(ROUTES.search(query));
      finish();
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, suggestions.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, -1));
        break;
      case "Enter":
        event.preventDefault();
        submit();
        break;
      case "Escape":
        close();
        break;
      // Focus moves on to the next control; without this it would land in the scrollable list
      case "Tab":
        close();
        break;
    }
  };

  return {
    query,
    suggestions,
    activeIndex,
    isOpen: open && suggestions.length > 0,
    /** The text is long enough to search for. */
    searchable,
    pending,
    changeQuery,
    selectMovie,
    handleKeyDown,
    reopen: () => setOpen(suggestions.length > 0),
    close,
  };
}
