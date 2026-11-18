import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getUserStats } from "@/features/stats/api/stats.api";
import { statsKeys } from "@/features/stats/api/query-keys";

/** The logged-in user's stats (Pro). */
export function useUserStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: statsKeys.forUser(user?.id ?? ""),
    queryFn: getUserStats,
    enabled: Boolean(user),
  });
}
