import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getRecommendations } from "@/features/recommendations/api/recommendations.api";
import { recommendationKeys } from "@/features/recommendations/api/query-keys";
import { RECOMMENDATIONS_STALE_MINUTES } from "@/features/recommendations/constants";
import { MINUTE_MS } from "@/shared/lib/time";

/** The user's recommendations; pass `enabled: false` for plans without them. */
export function useRecommendations({ enabled = true }: { enabled?: boolean } = {}) {
  const { user } = useAuth();
  return useQuery({
    queryKey: recommendationKeys.forUser(user?.id ?? ""),
    queryFn: getRecommendations,
    enabled: enabled && Boolean(user),
    // Building them takes many TMDB calls, and they only change with the user's own activity
    staleTime: RECOMMENDATIONS_STALE_MINUTES * MINUTE_MS,
  });
}
