import type { MovieListDetails, MovieListSummary } from "@/entities/movie-list/types";
import { API_ROUTES } from "@/shared/api-routes";
import { deleteJson, fetchJson, postJson, withQuery } from "@/shared/lib/http";

interface ListResponse {
  list: MovieListDetails;
}

export const getLists = async (movieId?: string) =>
  (await fetchJson<{ lists: MovieListSummary[] }>(withQuery(API_ROUTES.lists.all, { movieId })))
    .lists;

export const getList = async (listId: string) =>
  (await fetchJson<ListResponse>(API_ROUTES.lists.item(listId))).list;

export const createListRequest = async (input: { name: string; movieId?: string }) =>
  (await postJson<ListResponse>(API_ROUTES.lists.all, input)).list;

export const renameListRequest = async (listId: string, name: string) =>
  (
    await fetchJson<ListResponse>(API_ROUTES.lists.item(listId), {
      method: "PATCH",
      body: JSON.stringify({ name }),
    })
  ).list;

export const deleteListRequest = (listId: string) =>
  deleteJson<void>(API_ROUTES.lists.item(listId));

export const addListMovie = async (listId: string, movieId: string) =>
  (await postJson<ListResponse>(API_ROUTES.lists.movies(listId), { movieId })).list;

export const removeListMovie = async (listId: string, movieId: string) =>
  (await deleteJson<ListResponse>(API_ROUTES.lists.movie(listId, movieId))).list;

export const reorderListRequest = async (listId: string, movieIds: string[]) =>
  (
    await fetchJson<ListResponse>(API_ROUTES.lists.order(listId), {
      method: "PATCH",
      body: JSON.stringify({ movieIds }),
    })
  ).list;
