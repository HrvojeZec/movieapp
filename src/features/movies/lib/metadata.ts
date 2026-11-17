import type { Metadata } from "next";
import { APP_NAME } from "@/shared/constants";
import { META_DESCRIPTION_MAX_LENGTH, OG_POSTER } from "@/features/movies/constants";
import { getImageUrl } from "@/features/movies/lib/images";
import type { MovieDetails } from "@/features/movies/types";
import { formatYear, truncate } from "@/shared/lib/format";

/** Title, description and social preview (poster) for a movie page. */
export function buildMovieMetadata(movie: MovieDetails): Metadata {
  const year = movie.release_date ? ` (${formatYear(movie.release_date)})` : "";
  const title = `${movie.title}${year}`;
  const description = truncate(movie.overview, META_DESCRIPTION_MAX_LENGTH) || undefined;
  const images = movie.poster_path
    ? [
        {
          url: getImageUrl(movie.poster_path, OG_POSTER.size),
          width: OG_POSTER.width,
          height: OG_POSTER.height,
          alt: `${movie.title} poster`,
        },
      ]
    : undefined;

  return {
    title,
    description,
    openGraph: { siteName: APP_NAME, type: "video.movie", title, description, images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}
