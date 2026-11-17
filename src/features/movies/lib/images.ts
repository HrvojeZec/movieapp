// TMDB's public image CDN; serving posters needs no API key
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export const getImageUrl = (
  path: string | null,
  size: "w200" | "w300" | "w500" | "w780" | "w1280" | "original" = "w500",
) => {
  if (!path) return "/placeholder-movie.svg";
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};
