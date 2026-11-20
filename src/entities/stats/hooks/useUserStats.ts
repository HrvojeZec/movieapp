import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/entities/user/hooks/useAuth";
import { getUserStats } from "@/entities/stats/api/stats.api";
import { statsKeys } from "@/entities/stats/api/query-keys";

/** The logged-in user's stats (Pro). */
export function useUserStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: statsKeys.forUser(user?.id ?? ""),
    queryFn: getUserStats,
    enabled: Boolean(user),
  });
}
