import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/features/auth/api/query-keys";
import type { AuthUser } from "@/features/auth/types";
import { deleteWatched, postWatched } from "@/features/watched/api/watched.api";
import { watchedKeys } from "@/features/watched/api/query-keys";
import { updateWatchlist } from "@/features/watchlist/lib/watchlist";
import { toggleId } from "@/shared/lib/id-list";
import { notifyError } from "@/shared/lib/notify";

interface WatchedChange {
  userId: string;
  movieId: string;
  watched: boolean;
}

/** Optimistically marks or unmarks a movie; a no-op for logged-out users. */
export function useToggleWatched() {
  const queryClient = useQueryClient();

  const setIds = (userId: string, update: (ids: string[]) => string[]) =>
    queryClient.setQueryData<string[]>(watchedKeys.ids(userId), (ids) => update(ids ?? []));

  const { mutate } = useMutation({
    mutationKey: watchedKeys.toggle,
    mutationFn: ({ movieId, watched }: WatchedChange) =>
      watched ? postWatched(movieId) : deleteWatched(movieId),
    onMutate: async ({ userId, movieId, watched }) => {
      await queryClient.cancelQueries({ queryKey: watchedKeys.ids(userId) });
      setIds(userId, (ids) => toggleId(ids, movieId, watched));
      // The server takes a watched movie off the watchlist; show that right away
      if (watched) updateWatchlist(queryClient, (watchlist) => toggleId(watchlist, movieId, false));
    },
    onError: (_error, { userId, movieId, watched }) => {
      setIds(userId, (ids) => toggleId(ids, movieId, !watched));
      // Whether the movie was on the watchlist isn't known here, so ask the server
      if (watched) void queryClient.invalidateQueries({ queryKey: authKeys.me });
      notifyError("Could not update your watched movies", "Please try again");
    },
    onSettled: () => {
      // Refetch once the last toggle is done, so quick clicks on several movies don't jump
      if (queryClient.isMutating({ mutationKey: watchedKeys.toggle }) === 1) {
        void queryClient.invalidateQueries({ queryKey: watchedKeys.all });
      }
    },
  });

  return useCallback(
    (movieId: string) => {
      const user = queryClient.getQueryData<AuthUser | null>(authKeys.me);
      if (!user) return;
      const ids = queryClient.getQueryData<string[]>(watchedKeys.ids(user.id)) ?? [];
      mutate({ userId: user.id, movieId, watched: !ids.includes(movieId) });
    },
    [queryClient, mutate],
  );
}
