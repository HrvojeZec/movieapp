import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/entities/user/hooks/useAuth";
import { getList } from "@/entities/movie-list/api/lists.api";
import { listKeys } from "@/entities/movie-list/api/query-keys";
import { HttpError } from "@/shared/lib/http";
import { isClientError } from "@/shared/lib/http-status";

/** One of the user's lists with its movies. */
export function useList(listId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: listKeys.detail(user?.id ?? "", listId),
    queryFn: () => getList(listId),
    enabled: Boolean(user),
    // A 404 won't turn into a list by asking again
    retry: (failureCount, error) =>
      !(error instanceof HttpError && isClientError(error.status)) && failureCount < 2,
  });
}
