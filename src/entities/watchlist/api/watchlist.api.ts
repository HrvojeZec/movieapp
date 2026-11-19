import { API_ROUTES } from "@/shared/api-routes";
import { deleteJson, postJson } from "@/shared/lib/http";

interface WatchlistResponse {
  watchlist: string[];
}

export const postWatchlist = (movieId: string) =>
  postJson<WatchlistResponse>(API_ROUTES.user.watchlist, { movieId });

export const deleteWatchlist = (movieId: string) =>
  deleteJson<WatchlistResponse>(API_ROUTES.user.watchlistItem(movieId));
