"use client";
import { useId, type FocusEvent, type ReactNode } from "react";
import { Box, ScrollArea, TextInput } from "@mantine/core";
import { Search } from "lucide-react";
import { useSearchSuggestions } from "@/features/search-movies/hooks/useSearchSuggestions";
import {
  SuggestionList,
  suggestionOptionId,
  type SuggestionVariant,
} from "@/features/search-movies/ui/SuggestionList/SuggestionList";
import classes from "./MovieSearchBox.module.scss";

const DROPDOWN_MAX_HEIGHT = 400;

interface MovieSearchBoxProps {
  placeholder: string;
  initialQuery?: string;
  clearOnSubmit?: boolean;
  variant?: SuggestionVariant;
  size?: "sm" | "md" | "lg";
  autoFocus?: boolean;
  /** Shown inside the input on the right, e.g. a keyboard shortcut hint. */
  rightSection?: ReactNode;
}

/** Search input with debounced suggestions; Enter opens the selected movie or the results page. */
export function MovieSearchBox({
  placeholder,
  initialQuery,
  clearOnSubmit,
  variant = "compact",
  size = "sm",
  autoFocus,
  rightSection,
}: MovieSearchBoxProps) {
  const search = useSearchSuggestions({ initialQuery, clearOnSubmit });
  const listId = useId();
  const activeId =
    search.isOpen && search.activeIndex >= 0
      ? suggestionOptionId(listId, search.activeIndex)
      : undefined;

  // Tabbing away or clicking elsewhere closes the list; moving focus within the box doesn't
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) search.close();
  };

  return (
    <Box className={classes.root} onBlur={handleBlur}>
      <TextInput
        placeholder={placeholder}
        aria-label="Search movies"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={search.isOpen}
        aria-controls={search.isOpen ? listId : undefined}
        aria-activedescendant={activeId}
        leftSection={<Search size={size === "lg" ? 18 : 16} />}
        rightSection={rightSection}
        rightSectionWidth="auto"
        size={size}
        autoFocus={autoFocus}
        value={search.query}
        onChange={(event) => search.changeQuery(event.target.value)}
        onKeyDown={search.handleKeyDown}
        onFocus={search.reopen}
        classNames={{ input: classes.input }}
      />

      {search.isOpen && (
        <Box className={classes.dropdown}>
          <ScrollArea.Autosize mah={DROPDOWN_MAX_HEIGHT}>
            <SuggestionList
              query={search.query}
              id={listId}
              label="Suggestions"
              movies={search.suggestions}
              activeIndex={search.activeIndex}
              onSelect={search.selectMovie}
              variant={variant}
            />
          </ScrollArea.Autosize>
        </Box>
      )}
    </Box>
  );
}
