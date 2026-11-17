import { fetchJson } from "@/shared/lib/http";

export const favoritesMutationKey = ["auth", "favorites"] as const;

export const postFavorite = (movieId: string) =>
  fetchJson<{ favorites: string[] }>("/api/user/favorites", {
    method: "POST",
    body: JSON.stringify({ movieId }),
  });

export const deleteFavorite = (movieId: string) =>
  fetchJson<{ favorites: string[] }>(`/api/user/favorites/${movieId}`, {
    method: "DELETE",
  });
