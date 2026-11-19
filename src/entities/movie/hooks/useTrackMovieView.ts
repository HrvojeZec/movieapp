import { useEffect, useRef } from "react";
import { useAuth } from "@/entities/user/hooks/useAuth";
import { postMovieView } from "@/entities/movie/api/activity.api";

/** Reports a logged-in user's visit to a movie page, for stats and recommendations. */
export function useTrackMovieView(movieId: number | undefined) {
  const { user, loading } = useAuth();
  const userId = user?.id;
  const reported = useRef<string | null>(null);

  useEffect(() => {
    if (loading || !userId || movieId === undefined) return;
    // Once per visit: Strict Mode and refetches run the effect again (the server also keeps one
    // view per hour, this just saves the requests)
    const visit = `${userId}:${movieId}`;
    if (reported.current === visit) return;
    reported.current = visit;
    // Only feeds stats, so a failed report isn't worth bothering the user about
    postMovieView(String(movieId)).catch(() => {});
  }, [loading, userId, movieId]);
}
