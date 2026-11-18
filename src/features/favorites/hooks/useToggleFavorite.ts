import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/features/auth/api/query-keys";
import type { AuthUser } from "@/features/auth/types";
import { deleteFavorite, postFavorite } from "@/features/favorites/api/favorites.api";
import { favoriteKeys } from "@/features/favorites/api/query-keys";
import { applyFavoriteChange, updateFavorites } from "@/features/favorites/lib/favorites";
import type { FavoriteChange } from "@/features/favorites/types";
import { toApiError } from "@/shared/lib/api-error";
import { HttpError } from "@/shared/lib/http";
import { HTTP_STATUS } from "@/shared/lib/http-status";
import { notifyError } from "@/shared/lib/notify";

/** Optimistically adds or removes a favorite; returns a no-op for logged-out users. */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationKey: favoriteKeys.toggle,
    mutationFn: ({ movieId, add }: FavoriteChange) =>
      add ? postFavorite(movieId) : deleteFavorite(movieId),
    onMutate: async ({ movieId, add }) => {
      // A profile refetch landing now would overwrite the optimistic change
      await queryClient.cancelQueries({ queryKey: authKeys.me });
      updateFavorites(queryClient, (favorites) => applyFavoriteChange(favorites, movieId, add));
    },
    onSuccess: ({ favorites }) => {
      // With other toggles still in flight the server list is already outdated; the last one syncs
      if (queryClient.isMutating({ mutationKey: favoriteKeys.toggle }) === 1) {
        updateFavorites(queryClient, () => favorites);
      }
    },
    // Undo only this movie instead of restoring a snapshot, so concurrent toggles are kept
    onError: (error, { movieId, add }) => {
      updateFavorites(queryClient, (favorites) => applyFavoriteChange(favorites, movieId, !add));
      // A full list on the free plan is a 403 that says how to get more; anything else is a retry
      if (error instanceof HttpError && error.status === HTTP_STATUS.FORBIDDEN) {
        notifyError("Favorites limit reached", toApiError(error).message);
      } else {
        notifyError("Could not update favorites", "Please try again");
      }
    },
  });

  return useCallback(
    (movieId: string) => {
      const user = queryClient.getQueryData<AuthUser | null>(authKeys.me);
      if (!user) return;
      mutate({ movieId, add: !user.favorites.includes(movieId) });
    },
    [queryClient, mutate],
  );
}
