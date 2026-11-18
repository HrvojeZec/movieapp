import type { WatchedPage } from "@/features/watched/types";
import { API_ROUTES } from "@/shared/api-routes";
import { deleteJson, fetchJson, postJson, withQuery } from "@/shared/lib/http";

export const getWatchedPage = (page: number) =>
  fetchJson<WatchedPage>(withQuery(API_ROUTES.user.watched, { page }));

export const getWatchedIds = async () =>
  (await fetchJson<{ ids: string[] }>(API_ROUTES.user.watchedIds)).ids;

export const postWatched = (movieId: string) =>
  postJson<void>(API_ROUTES.user.watched, { movieId });

export const deleteWatched = (movieId: string) =>
  deleteJson<void>(API_ROUTES.user.watchedItem(movieId));
