"use client";
import { useEffect } from "react";
import Image from "next/image";
import { Box, Group, Text, UnstyledButton } from "@mantine/core";
import { getImageUrl } from "@/entities/movie/lib/images";
import { formatRating } from "@/entities/movie/lib/movies";
import type { Movie, MovieSummary } from "@/entities/movie/types";
import { formatYear } from "@/shared/lib/format";
import { highlightMatch } from "@/shared/lib/highlight";
import classes from "./SuggestionList.module.scss";

// Poster thumbnail size per variant (2:3 like TMDB posters)
const THUMBNAILS = {
  compact: { width: 40, height: 60 },
  detailed: { width: 50, height: 75 },
} as const;

export type SuggestionVariant = keyof typeof THUMBNAILS;

/** The DOM id of an option, for `aria-activedescendant` on the input that controls the list. */
export const suggestionOptionId = (listId: string, index: number) => `${listId}-option-${index}`;

interface SuggestionListProps {
  id: string;
  label: string;
  movies: (MovieSummary & Partial<Pick<Movie, "overview">>)[];
  activeIndex: number;
  onSelect: (movie: MovieSummary) => void;
  /** `detailed` also shows each movie's overview. */
  variant?: SuggestionVariant;
  /** The typed text, marked in each title. */
  query?: string;
}

/**
 * An ARIA listbox of movies. Focus stays in the controlling input: options are highlighted with
 * the arrow keys (`activeIndex`) or clicked.
 */
export function SuggestionList({
  id,
  label,
  movies,
  activeIndex,
  onSelect,
  variant = "compact",
  query = "",
}: SuggestionListProps) {
  const thumbnail = THUMBNAILS[variant];
  const detailed = variant === "detailed";

  // Keep the option chosen with the arrow keys in view inside a scrolling container
  useEffect(() => {
    if (activeIndex < 0) return;
    document.getElementById(suggestionOptionId(id, activeIndex))?.scrollIntoView({
      block: "nearest",
    });
  }, [id, activeIndex]);

  return (
    <Box id={id} role="listbox" aria-label={label}>
      {movies.map((movie, index) => (
        <UnstyledButton
          key={movie.id}
          id={suggestionOptionId(id, index)}
          role="option"
          aria-selected={index === activeIndex}
          tabIndex={-1}
          // Keep focus in the input, so a click doesn't close the list before it registers
          onMouseDown={(event) => event.preventDefault()}
          p={detailed ? "md" : "sm"}
          className={`${classes.option} ${index === activeIndex ? classes.active : ""}`}
          onClick={() => onSelect(movie)}
        >
          <Group gap={detailed ? "md" : "sm"} wrap="nowrap">
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
                {highlightMatch(movie.title, query).map((part, partIndex) =>
                  part.match ? (
                    <mark key={partIndex} className={classes.match}>
                      {part.text}
                    </mark>
                  ) : (
                    part.text
                  ),
                )}
              </Text>
              <Text size="xs" c="dimmed">
                {formatYear(movie.release_date)} • ★ {formatRating(movie.vote_average)}
              </Text>
              {detailed && movie.overview && (
                <Text size="xs" c="gray.5" lineClamp={2} mt={4}>
                  {movie.overview}
                </Text>
              )}
            </Box>
          </Group>
        </UnstyledButton>
      ))}
    </Box>
  );
}
