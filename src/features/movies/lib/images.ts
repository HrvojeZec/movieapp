import { PLACEHOLDER_POSTER } from "@/features/movies/constants";
import type { TmdbImageSize } from "@/features/movies/types";

// TMDB's public image CDN; serving posters needs no API key
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export const getImageUrl = (path: string | null, size: TmdbImageSize = "w500") => {
  if (!path) return PLACEHOLDER_POSTER;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};
