"use client";
import { useIntersection } from "@mantine/hooks";
import { Drama } from "lucide-react";
import { GENRE_ROW_PRELOAD_MARGIN } from "@/entities/movie/constants";
import { useDiscoverMovies } from "@/entities/movie/hooks/useDiscoverMovies";
import type { Genre } from "@/entities/movie/types";
import { HorizontalMovieScroll } from "@/widgets/movie-collections/ui/HorizontalMovieScroll/HorizontalMovieScroll";
import { QueryError } from "@/shared/ui/QueryError/QueryError";

/** A genre row that only fetches its movies once it scrolls near the viewport. */
export function GenreRow({ genre }: { genre: Genre }) {
  const { ref, entry } = useIntersection<HTMLDivElement>({ rootMargin: GENRE_ROW_PRELOAD_MARGIN });
  const nearViewport = Boolean(entry?.isIntersecting);
  const { data, isPending, isError, refetch } = useDiscoverMovies(
    { genre: genre.id },
    { enabled: nearViewport },
  );

  return (
    <div ref={ref} data-offscreen={nearViewport ? undefined : true}>
      {isError ? (
        <QueryError message={`Couldn't load ${genre.name} movies.`} onRetry={() => refetch()} />
      ) : (
        <HorizontalMovieScroll
          title={genre.name}
          icon={<Drama size={18} />}
          movies={data?.results ?? []}
          loading={isPending}
        />
      )}
    </div>
  );
}
