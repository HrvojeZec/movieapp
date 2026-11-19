import type { QueryClient } from "@tanstack/react-query";
import { authKeys } from "@/entities/user/api/query-keys";
import type { AuthUser } from "@/entities/user/types";
import { toggleId } from "@/shared/lib/id-list";

export const applyFavoriteChange = toggleId;

/** Favorites live on the cached session user, so only that list is replaced. */
export function updateFavorites(
  queryClient: QueryClient,
  update: (favorites: string[]) => string[],
) {
  queryClient.setQueryData<AuthUser | null>(authKeys.me, (user) =>
    user ? { ...user, favorites: update(user.favorites) } : user,
  );
}
