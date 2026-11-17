import type { Video } from "@/features/movies/types";

export const getTrailerUrl = (videos: Video[]): string | null => {
  const officialTrailer = videos.find(
    (video) => video.type === "Trailer" && video.official && video.site === "YouTube",
  );

  if (officialTrailer) {
    return `https://www.youtube.com/embed/${officialTrailer.key}?autoplay=1&rel=0`;
  }

  const anyTrailer = videos.find((video) => video.type === "Trailer" && video.site === "YouTube");

  if (anyTrailer) {
    return `https://www.youtube.com/embed/${anyTrailer.key}?autoplay=1&rel=0`;
  }

  return null;
};
