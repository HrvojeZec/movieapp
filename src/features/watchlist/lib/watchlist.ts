import type { QueryClient } from "@tanstack/react-query";
import { authKeys } from "@/features/auth/api/query-keys";
import type { AuthUser } from "@/features/auth/types";

/** The watchlist lives on the cached session user, so only that list is replaced. */
export function updateWatchlist(
  queryClient: QueryClient,
  update: (watchlist: string[]) => string[],
) {
  queryClient.setQueryData<AuthUser | null>(authKeys.me, (user) =>
    user ? { ...user, watchlist: update(user.watchlist ?? []) } : user,
  );
}
