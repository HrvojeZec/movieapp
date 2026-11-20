import { API_ROUTES } from "@/shared/api-routes";
import { deleteJson, postJson } from "@/shared/lib/http";

interface FavoritesResponse {
  favorites: string[];
}

export const postFavorite = (movieId: string) =>
  postJson<FavoritesResponse>(API_ROUTES.user.favorites, { movieId });

export const deleteFavorite = (movieId: string) =>
  deleteJson<FavoritesResponse>(API_ROUTES.user.favorite(movieId));
