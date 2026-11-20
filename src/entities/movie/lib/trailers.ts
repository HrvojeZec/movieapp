import type { Video } from "@/entities/movie/types";

const YOUTUBE_EMBED_URL = "https://www.youtube.com/embed";

const isYouTubeTrailer = (video: Video) => video.type === "Trailer" && video.site === "YouTube";

/** Embed URL of the official YouTube trailer, or any YouTube trailer, or null if there is none. */
export const getTrailerUrl = (videos: Video[]): string | null => {
  const trailer =
    videos.find((video) => isYouTubeTrailer(video) && video.official) ??
    videos.find(isYouTubeTrailer);

  return trailer ? `${YOUTUBE_EMBED_URL}/${trailer.key}?autoplay=1&rel=0` : null;
};
