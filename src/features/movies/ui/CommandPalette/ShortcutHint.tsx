"use client";
import { Kbd, UnstyledButton } from "@mantine/core";
import { useOs } from "@mantine/hooks";
import { useCommandPaletteStore } from "@/features/movies/store/command-palette.store";

const APPLE_SYSTEMS = new Set(["macos", "ios"]);

/** Advertises the search shortcut inside the navbar search box and opens the palette on click. */
export function ShortcutHint() {
  const open = useCommandPaletteStore((state) => state.open);
  // Detected after mounting, so the server render and the first client render agree
  const modifier = APPLE_SYSTEMS.has(useOs()) ? "⌘" : "Ctrl";

  return (
    <UnstyledButton onClick={open} aria-label={`Open search (${modifier}+K)`} pr="xs">
      <Kbd size="xs">{modifier} K</Kbd>
    </UnstyledButton>
  );
}
