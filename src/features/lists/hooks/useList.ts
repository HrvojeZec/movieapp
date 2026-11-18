import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getList } from "@/features/lists/api/lists.api";
import { listKeys } from "@/features/lists/api/query-keys";
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
