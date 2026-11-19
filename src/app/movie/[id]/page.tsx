import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { movieKeys } from "@/features/movies/api/query-keys";
import { buildMovieMetadata } from "@/features/movies/lib/metadata";
import { loadMoviePage } from "@/features/movies/server/movie-page";
import { MovieDetailsView } from "@/views/movie-details/MovieDetailsView";
import { getServerQueryClient } from "@/server/query-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

const FALLBACK_TITLE = "Movie details";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { movie } = await loadMoviePage((await params).id);
  return movie ? buildMovieMetadata(movie) : { title: FALLBACK_TITLE };
}

export default async function Page({ params }: PageProps) {
  const { id, movie } = await loadMoviePage((await params).id);

  const queryClient = getServerQueryClient();
  if (movie) queryClient.setQueryData(movieKeys.details(id), movie);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MovieDetailsView />
    </HydrationBoundary>
  );
}
