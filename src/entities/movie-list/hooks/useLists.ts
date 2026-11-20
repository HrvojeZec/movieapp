import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/entities/user/hooks/useAuth";
import { getLists } from "@/entities/movie-list/api/lists.api";
import { listKeys } from "@/entities/movie-list/api/query-keys";

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
