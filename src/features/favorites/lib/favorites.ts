import type { QueryClient } from "@tanstack/react-query";
import { authKeys } from "@/features/auth/api/queries";
import type { AuthUser } from "@/features/auth/types";

export function applyFavoriteChange(favorites: string[], movieId: string, add: boolean): string[] {
  const without = favorites.filter((id) => id !== movieId);
  return add ? [...without, movieId] : without;
}

/** Favorites live on the cached session user, so only that list is replaced. */
export function updateFavorites(
  queryClient: QueryClient,
  update: (favorites: string[]) => string[],
) {
  queryClient.setQueryData<AuthUser | null>(authKeys.me, (user) =>
    user ? { ...user, favorites: update(user.favorites) } : user,
  );
}
