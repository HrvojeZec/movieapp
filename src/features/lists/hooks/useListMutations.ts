import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addListMovie,
  createListRequest,
  deleteListRequest,
  removeListMovie,
  renameListRequest,
} from "@/features/lists/api/lists.api";
import { listKeys } from "@/features/lists/api/query-keys";
import { toApiError } from "@/shared/lib/api-error";
import { notifyError } from "@/shared/lib/notify";

// The server's messages (plan required, a limit reached) are written for the user
const showError = (title: string) => (error: unknown) =>
  notifyError(title, toApiError(error).message);

/** Every change to lists; each refetches the lists afterwards, as counts and order change. */
export function useListMutations() {
  const queryClient = useQueryClient();
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

  return { create, rename, remove, toggleMovie };
}
