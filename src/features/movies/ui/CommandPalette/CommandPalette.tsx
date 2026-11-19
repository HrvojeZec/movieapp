"use client";
import { useEffect, useId } from "react";
import { usePathname } from "next/navigation";
import { Modal, ScrollArea, Stack, Text, TextInput } from "@mantine/core";
import { useHotkeys, useMediaQuery } from "@mantine/hooks";
import { Search } from "lucide-react";
import { PALETTE_RECENT_LIMIT, SEARCH_SUGGESTION_MIN_LENGTH } from "@/features/movies/constants";
import { useRecentlyViewed } from "@/features/movies/hooks/useRecentlyViewed";
import { useSearchSuggestions } from "@/features/movies/hooks/useSearchSuggestions";
import { useCommandPaletteStore } from "@/features/movies/store/command-palette.store";
import type { MovieSummary } from "@/features/movies/types";
import {
  SuggestionList,
  suggestionOptionId,
} from "@/features/movies/ui/SuggestionList/SuggestionList";

export const COMMAND_PALETTE_SHORTCUT = "mod+K";
const LIST_MAX_HEIGHT = 420;
// Full screen on phones, where a centered dialog would leave no room for the keyboard
const PHONE_QUERY = "(max-width: 36em)";

/** Ctrl+K / ⌘K search over all movies; shows recently viewed ones before anything is typed. */
export function CommandPalette() {
  const opened = useCommandPaletteStore((state) => state.opened);
  const close = useCommandPaletteStore((state) => state.close);
  const toggle = useCommandPaletteStore((state) => state.toggle);
  const pathname = usePathname();
  const isPhone = useMediaQuery(PHONE_QUERY);
  const recent = useRecentlyViewed();

  // Works while typing in another input too, since it's the app-wide search shortcut
  useHotkeys([[COMMAND_PALETTE_SHORTCUT, toggle]], []);

  // Opening a movie or the results page closes the palette
  useEffect(() => {
    close();
  }, [pathname, close]);

  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Search movies"
      size="lg"
      fullScreen={isPhone}
      transitionProps={{ transition: "pop", duration: 150 }}
    >
      <PaletteSearch recent={recent.slice(0, PALETTE_RECENT_LIMIT)} />
    </Modal>
  );
}

// Mounted only while the palette is open, so every opening starts with an empty search
function PaletteSearch({ recent }: { recent: MovieSummary[] }) {
  const search = useSearchSuggestions({ clearOnSubmit: true, emptyResults: recent });
  const listId = useId();
  const hasResults = search.suggestions.length > 0;
  const activeId =
    search.activeIndex >= 0 ? suggestionOptionId(listId, search.activeIndex) : undefined;

  const emptyMessage = !search.query.trim()
    ? "Type to search movies."
    : !search.searchable
      ? `Type at least ${SEARCH_SUGGESTION_MIN_LENGTH} characters.`
      : search.pending
        ? "Searching…"
        : "No movies found.";

  return (
    <Stack gap="sm">
      <TextInput
        data-autofocus
        placeholder="Search movies..."
        aria-label="Search movies"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={hasResults}
        aria-controls={hasResults ? listId : undefined}
        aria-activedescendant={activeId}
        leftSection={<Search size={16} />}
        value={search.query}
        onChange={(event) => search.changeQuery(event.target.value)}
        onKeyDown={search.handleKeyDown}
      />

      {!search.query.trim() && hasResults && (
        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
          Recently viewed
        </Text>
      )}

      {hasResults ? (
        <ScrollArea.Autosize mah={LIST_MAX_HEIGHT}>
          <SuggestionList
            query={search.query}
            id={listId}
            label={search.query.trim() ? "Suggestions" : "Recently viewed"}
            movies={search.suggestions}
            activeIndex={search.activeIndex}
            onSelect={search.selectMovie}
          />
        </ScrollArea.Autosize>
      ) : (
        <Text size="sm" c="dimmed" ta="center" py="md">
          {emptyMessage}
        </Text>
      )}

      {/* Keyboard hints mean nothing on a touch screen */}
      <Text size="xs" c="dimmed" visibleFrom="sm">
        ↑ ↓ to choose · Enter to open · Esc to close
      </Text>
    </Stack>
  );
}
