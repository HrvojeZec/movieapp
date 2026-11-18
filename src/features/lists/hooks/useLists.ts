import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getLists } from "@/features/lists/api/lists.api";
import { listKeys } from "@/features/lists/api/query-keys";

interface UseListsOptions {
  /** Each list then says whether it holds this movie. */
  movieId?: string;
  enabled?: boolean;
}

/** The user's lists, recently changed first. */
export function useLists({ movieId, enabled = true }: UseListsOptions = {}) {
  const { user } = useAuth();
  return useQuery({
    queryKey: listKeys.summaries(user?.id ?? "", movieId),
    queryFn: () => getLists(movieId),
    enabled: enabled && Boolean(user),
  });
}
