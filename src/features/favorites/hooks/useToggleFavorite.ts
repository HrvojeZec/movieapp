import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { authKeys } from "@/features/auth/api/queries";
import type { AuthUser } from "@/features/auth/types";
import {
  deleteFavorite,
  favoritesMutationKey,
  postFavorite,
} from "@/features/favorites/api/favorites.api";
import { applyFavoriteChange, updateFavorites } from "@/features/favorites/lib/favorites";
import type { FavoriteChange } from "@/features/favorites/types";

/** Optimistically adds or removes a favorite; returns a no-op for logged-out users. */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationKey: favoritesMutationKey,
    mutationFn: ({ movieId, add }: FavoriteChange) =>
      add ? postFavorite(movieId) : deleteFavorite(movieId),
    onMutate: async ({ movieId, add }) => {
      // A profile refetch landing now would overwrite the optimistic change
      await queryClient.cancelQueries({ queryKey: authKeys.me });
      updateFavorites(queryClient, (favorites) => applyFavoriteChange(favorites, movieId, add));
    },
    onSuccess: ({ favorites }) => {
      // With other toggles still in flight the server list is already outdated; the last one syncs
      if (queryClient.isMutating({ mutationKey: favoritesMutationKey }) === 1) {
        updateFavorites(queryClient, () => favorites);
      }
    },
    // Undo only this movie instead of restoring a snapshot, so concurrent toggles are kept
    onError: (_error, { movieId, add }) => {
      updateFavorites(queryClient, (favorites) => applyFavoriteChange(favorites, movieId, !add));
      notifications.show({
        title: "Could not update favorites",
        message: "Please try again",
        color: "red",
      });
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
