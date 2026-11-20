import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addListMovie,
  createListRequest,
  deleteListRequest,
  removeListMovie,
  renameListRequest,
  reorderListRequest,
} from "@/entities/movie-list/api/lists.api";
import { listKeys } from "@/entities/movie-list/api/query-keys";
import type { MovieListDetails } from "@/entities/movie-list/types";
import { useAuth } from "@/entities/user/hooks/useAuth";
import { sameMembers } from "@/shared/lib/same-members";
import { toApiError } from "@/shared/lib/api-error";
import { notifyError } from "@/shared/lib/notify";

// The server's messages (plan required, a limit reached) are written for the user
const showError = (title: string) => (error: unknown) =>
  notifyError(title, toApiError(error).message);

/** Every change to lists; each refetches the lists afterwards, as counts and order change. */
export function useListMutations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const refresh = () => queryClient.invalidateQueries({ queryKey: listKeys.all });

  const create = useMutation({
    mutationFn: createListRequest,
    onSuccess: refresh,
    onError: showError("Could not create the list"),
  });

  const rename = useMutation({
    mutationFn: ({ listId, name }: { listId: string; name: string }) =>
      renameListRequest(listId, name),
    onSuccess: refresh,
    onError: showError("Could not rename the list"),
  });

  const remove = useMutation({
    mutationFn: deleteListRequest,
    onSuccess: refresh,
    onError: showError("Could not delete the list"),
  });

  const toggleMovie = useMutation({
    mutationFn: ({ listId, movieId, add }: { listId: string; movieId: string; add: boolean }) =>
      add ? addListMovie(listId, movieId) : removeListMovie(listId, movieId),
    onSuccess: refresh,
    onError: showError("Could not update the list"),
  });

  // Shown at once; the previous order comes back if the server refuses (e.g. the list changed)
  const reorder = useMutation({
    mutationFn: ({ listId, movieIds }: { listId: string; movieIds: string[] }) =>
      reorderListRequest(listId, movieIds),
    onMutate: async ({ listId, movieIds }) => {
      const key = listKeys.detail(user?.id ?? "", listId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<MovieListDetails>(key);
      if (previous && sameMembers(previous.movieIds, movieIds)) {
        queryClient.setQueryData<MovieListDetails>(key, { ...previous, movieIds });
      }
      return { key, previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(context.key, context.previous);
      showError("Could not save the new order")(error);
    },
    onSettled: refresh,
  });

  return { create, rename, remove, toggleMovie, reorder };
}
