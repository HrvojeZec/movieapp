import type { AdvancedDiscoverFilters, DiscoverFilters } from "@/features/movies/types";
import type { MovieList } from "@/features/movies/validations/movies.schema";

// Every key starts with "movies", so all movie data can be invalidated at once
export const movieKeys = {
  all: ["movies"] as const,
  list: (list: MovieList) => [...movieKeys.all, "list", list] as const,
  details: (id: number) => [...movieKeys.all, "details", id] as const,
  videos: (id: number) => [...movieKeys.all, "videos", id] as const,
  search: (query: string) => [...movieKeys.all, "search", query] as const,
  discover: (filters: DiscoverFilters) => [...movieKeys.all, "discover", filters] as const,
  discoverFirstPage: (filters: DiscoverFilters) =>
    [...movieKeys.discover(filters), "first-page"] as const,
  // Not under "discover": invalidating basic results shouldn't touch these, and the reverse
  advancedDiscover: (filters: DiscoverFilters & AdvancedDiscoverFilters) =>
    [...movieKeys.all, "advanced-discover", filters] as const,
  genres: () => [...movieKeys.all, "genres"] as const,
};
