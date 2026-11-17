"use client";
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

  return (
    <Box className={classes.root}>
      <TextInput
        placeholder={placeholder}
        aria-label="Search movies"
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
        <Box className={classes.dropdown}>
          <ScrollArea.Autosize mah={DROPDOWN_MAX_HEIGHT}>
            {search.suggestions.map((movie, index) => (
              <UnstyledButton
                key={movie.id}
                p={variant === "detailed" ? "md" : "sm"}
                className={`${classes.option} ${index === search.activeIndex ? classes.active : ""}`}
                onClick={() => search.selectMovie(movie)}
              >
                <Group gap={variant === "detailed" ? "md" : "sm"} wrap="nowrap">
                  <Image
                    src={getImageUrl(movie.poster_path, "w200")}
                    alt={movie.title}
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
