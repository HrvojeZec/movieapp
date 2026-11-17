"use client";
import { useEffect, useId, type FocusEvent } from "react";
import Image from "next/image";
import { Box, Group, ScrollArea, Text, TextInput, UnstyledButton } from "@mantine/core";
import { Search } from "lucide-react";
import { useSearchSuggestions } from "@/features/movies/hooks/useSearchSuggestions";
import { getImageUrl } from "@/features/movies/lib/images";
import { formatRating } from "@/features/movies/lib/movies";
import { formatYear } from "@/shared/lib/format";
import classes from "./MovieSearchBox.module.scss";

const DROPDOWN_MAX_HEIGHT = 400;

// Poster thumbnail size per variant (2:3 like TMDB posters)
const THUMBNAILS = {
  compact: { width: 40, height: 60 },
  detailed: { width: 50, height: 75 },
} as const;

interface MovieSearchBoxProps {
  placeholder: string;
  initialQuery?: string;
  clearOnSubmit?: boolean;
  /** `detailed` also shows each movie's overview. */
  variant?: keyof typeof THUMBNAILS;
  size?: "sm" | "md" | "lg";
  autoFocus?: boolean;
}

/** Search input with debounced suggestions; Enter opens the selected movie or the results page. */
export function MovieSearchBox({
  placeholder,
  initialQuery,
  clearOnSubmit,
  variant = "compact",
  size = "sm",
  autoFocus,
}: MovieSearchBoxProps) {
  const search = useSearchSuggestions({ initialQuery, clearOnSubmit });
  const thumbnail = THUMBNAILS[variant];
  const listId = useId();
  const optionId = (index: number) => `${listId}-option-${index}`;
  const activeId =
    search.isOpen && search.activeIndex >= 0 ? optionId(search.activeIndex) : undefined;

  // Keep the option chosen with the arrow keys in view inside the scrolling list
  useEffect(() => {
    if (activeId) document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
  }, [activeId]);

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
        size={size}
        autoFocus={autoFocus}
        value={search.query}
        onChange={(event) => search.changeQuery(event.target.value)}
        onKeyDown={search.handleKeyDown}
        onFocus={search.reopen}
        classNames={{ input: classes.input }}
      />

      {search.isOpen && (
        <Box className={classes.dropdown} id={listId} role="listbox" aria-label="Suggestions">
          <ScrollArea.Autosize mah={DROPDOWN_MAX_HEIGHT}>
            {search.suggestions.map((movie, index) => (
              <UnstyledButton
                key={movie.id}
                id={optionId(index)}
                role="option"
                aria-selected={index === search.activeIndex}
                // Options are chosen with the arrow keys; focus stays in the input
                tabIndex={-1}
                onMouseDown={(event) => event.preventDefault()}
                p={variant === "detailed" ? "md" : "sm"}
                className={`${classes.option} ${index === search.activeIndex ? classes.active : ""}`}
                onClick={() => search.selectMovie(movie)}
              >
                <Group gap={variant === "detailed" ? "md" : "sm"} wrap="nowrap">
                  <Image
                    src={getImageUrl(movie.poster_path, "w200")}
                    // Decorative: the title is right next to it
                    alt=""
                    width={thumbnail.width}
                    height={thumbnail.height}
                    className={classes.poster}
                  />
                  <Box>
                    <Text size="sm" c="white" fw={500} lineClamp={1}>
                      {movie.title}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {formatYear(movie.release_date)} • ★ {formatRating(movie.vote_average)}
                    </Text>
                    {variant === "detailed" && (
                      <Text size="xs" c="gray.5" lineClamp={2} mt={4}>
                        {movie.overview}
                      </Text>
                    )}
                  </Box>
                </Group>
              </UnstyledButton>
            ))}
          </ScrollArea.Autosize>
        </Box>
      )}
    </Box>
  );
}
