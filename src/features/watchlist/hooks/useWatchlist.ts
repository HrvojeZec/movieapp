import { useAuth } from "@/entities/user/hooks/useAuth";
import { useEntitlements } from "@/entities/user/hooks/useEntitlements";
import { useToggleWatchlist } from "@/features/watchlist/hooks/useToggleWatchlist";
import { useAppRouter } from "@/shared/hooks/useAppRouter";
import { ROUTES } from "@/shared/routes";

/**
 * Watchlist state of one movie. Logged-out users go to login, and a plan without the watchlist
 * goes to pricing, instead of a request the server would refuse.
 */
export function useWatchlist(movieId: number | string) {
  const id = String(movieId);
  const { user, loading } = useAuth();
  const { can } = useEntitlements();
  const toggleWatchlist = useToggleWatchlist();
  const router = useAppRouter();
  const canUse = can("watchlist");

  const toggle = () => {
    if (!user) router.push(ROUTES.login);
    else if (!canUse) router.push(ROUTES.pricing);
    else toggleWatchlist(id);
  };

  return {
    inWatchlist: user?.watchlist?.includes(id) ?? false,
    isLoggedIn: Boolean(user),
    canUse,
    disabled: loading,
    toggle,
  };
}
