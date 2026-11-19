import { connection } from "next/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { prefetchHomeMovies } from "@/features/movies/server/prefetch";
import { HomeView } from "@/views/home/HomeView";
import { getServerQueryClient } from "@/server/query-client";

export default async function Page() {
  // Render per request instead of at build time: the build has no TMDB key, and a prerendered
  // empty page would be served until it revalidates. TMDB responses are still cached for an hour.
  await connection();

  const queryClient = getServerQueryClient();
  await prefetchHomeMovies(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeView />
    </HydrationBoundary>
  );
}
