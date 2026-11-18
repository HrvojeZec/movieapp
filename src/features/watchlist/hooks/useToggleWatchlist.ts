import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/features/auth/api/query-keys";
import type { AuthUser } from "@/features/auth/types";
import { deleteWatchlist, postWatchlist } from "@/features/watchlist/api/watchlist.api";
import { watchlistKeys } from "@/features/watchlist/api/query-keys";
import { updateWatchlist } from "@/features/watchlist/lib/watchlist";
import { toApiError } from "@/shared/lib/api-error";
import { HttpError } from "@/shared/lib/http";
import { HTTP_STATUS } from "@/shared/lib/http-status";
import { toggleId } from "@/shared/lib/id-list";
import { notifyError } from "@/shared/lib/notify";

interface WatchlistChange {
  movieId: string;
  add: boolean;
}

/** Optimistically adds or removes a movie, like favorites; a no-op for logged-out users. */
export function useToggleWatchlist() {
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationKey: watchlistKeys.toggle,
    mutationFn: ({ movieId, add }: WatchlistChange) =>
      add ? postWatchlist(movieId) : deleteWatchlist(movieId),
    onMutate: async ({ movieId, add }) => {
      await queryClient.cancelQueries({ queryKey: authKeys.me });
      updateWatchlist(queryClient, (watchlist) => toggleId(watchlist, movieId, add));
    },
    onSuccess: ({ watchlist }) => {
      // With other toggles still in flight the server list is already outdated; the last one syncs
      if (queryClient.isMutating({ mutationKey: watchlistKeys.toggle }) === 1) {
        updateWatchlist(queryClient, () => watchlist);
      }
    },
    onError: (error, { movieId, add }) => {
      updateWatchlist(queryClient, (watchlist) => toggleId(watchlist, movieId, !add));
      // A 403 means the plan doesn't include the watchlist (e.g. it just ended)
      if (error instanceof HttpError && error.status === HTTP_STATUS.FORBIDDEN) {
        notifyError("Premium feature", toApiError(error).message);
      } else {
        notifyError("Could not update your watchlist", "Please try again");
      }
    },
  });

  return useCallback(
    (movieId: string) => {
      const user = queryClient.getQueryData<AuthUser | null>(authKeys.me);
      if (!user) return;
      mutate({ movieId, add: !(user.watchlist ?? []).includes(movieId) });
    },
    [queryClient, mutate],
  );
}
