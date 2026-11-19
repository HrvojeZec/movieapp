import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/entities/user/hooks/useAuth";
import { watchedIdsQuery } from "@/entities/watched/api/queries";

const NONE: string[] = [];

/** IDs of the movies the user has watched; empty when logged out. */
export function useWatchedIds() {
  const { user } = useAuth();
  const { data, isPending } = useQuery({
    ...watchedIdsQuery(user?.id ?? ""),
    enabled: Boolean(user),
  });

  return { ids: data ?? NONE, loading: Boolean(user) && isPending };
}
