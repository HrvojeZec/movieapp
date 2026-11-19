import { useAuth } from "@/entities/user/hooks/useAuth";
import { useToggleWatched } from "@/features/mark-watched/hooks/useToggleWatched";
import { useWatchedIds } from "@/entities/watched/hooks/useWatchedIds";

/** Watched state of one movie for the logged-in user. */
export function useWatched(movieId: number | string) {
  const id = String(movieId);
  const { user, loading } = useAuth();
  const { ids, loading: idsLoading } = useWatchedIds();
  const toggleWatched = useToggleWatched();

  return {
    isWatched: ids.includes(id),
    isLoggedIn: Boolean(user),
    // Until the IDs arrive, a click wouldn't know whether to mark or unmark
    disabled: loading || idsLoading,
    toggle: () => toggleWatched(id),
  };
}
