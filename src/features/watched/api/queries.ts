import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { getWatchedIds, getWatchedPage } from "@/features/watched/api/watched.api";
import { watchedKeys } from "@/features/watched/api/query-keys";

export const watchedIdsQuery = (userId: string) =>
  queryOptions({ queryKey: watchedKeys.ids(userId), queryFn: getWatchedIds });

export const watchedHistoryQuery = (userId: string) =>
  infiniteQueryOptions({
    queryKey: watchedKeys.history(userId),
    queryFn: ({ pageParam }) => getWatchedPage(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });
