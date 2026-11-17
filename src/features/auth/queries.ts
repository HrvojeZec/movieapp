import { useCallback } from "react";
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { HttpError, fetchJson } from "@/shared/lib/http";
import type { ApiError } from "@/shared/types/api";
import type { AuthUser } from "./types";

export const authKeys = {
  me: ["auth", "me"] as const,
};

const favoritesMutationKey = ["auth", "favorites"] as const;

const UNEXPECTED_ERROR: ApiError = { message: "An unexpected error occurred" };

/** The auth cookie is httpOnly, so only the server can tell who is logged in. */
export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const { user } = await fetchJson<{ user: AuthUser }>("/api/user/profile");
    return user;
  } catch (error) {
    // No session (401) or a session for a deleted account (404) both mean "logged out"
    if (error instanceof HttpError && (error.status === 401 || error.status === 404)) return null;
    throw error;
  }
}

export const currentUserQuery = queryOptions({
  queryKey: authKeys.me,
  queryFn: fetchCurrentUser,
});

/** Narrows any thrown error to the `{ message, errors }` shape our API routes return. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof HttpError) {
    const body = error.body as Partial<ApiError> | undefined;
    return {
      message: error.message,
      errors: Array.isArray(body?.errors) ? body.errors : undefined,
    };
  }
  return UNEXPECTED_ERROR;
}

export function applyFavoriteChange(favorites: string[], movieId: string, add: boolean): string[] {
  const without = favorites.filter((id) => id !== movieId);
  return add ? [...without, movieId] : without;
}

function updateFavorites(queryClient: QueryClient, update: (favorites: string[]) => string[]) {
  queryClient.setQueryData<AuthUser | null>(authKeys.me, (user) =>
    user ? { ...user, favorites: update(user.favorites) } : user,
  );
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { data, isPending } = useQuery(currentUserQuery);

  const refreshUser = useCallback(
    () => queryClient.invalidateQueries({ queryKey: authKeys.me }),
    [queryClient],
  );

  return { user: data ?? null, loading: isPending, refreshUser };
}

interface Credentials {
  email: string;
  password: string;
}

interface Registration extends Credentials {
  name: string;
}

function useSessionMutation<TVariables>(
  path: string,
  messages: { successTitle: string; successMessage: string; failureTitle: string },
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: TVariables) =>
      fetchJson<{ user: AuthUser }>(path, { method: "POST", body: JSON.stringify(variables) }),
    onSuccess: ({ user }) => {
      queryClient.setQueryData(authKeys.me, user);
      notifications.show({
        title: messages.successTitle,
        message: messages.successMessage,
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: messages.failureTitle,
        message: toApiError(error).message,
        color: "red",
      });
    },
  });
}

export function useLogin() {
  return useSessionMutation<Credentials>("/api/auth/login", {
    successTitle: "Welcome back!",
    successMessage: "Successfully logged in",
    failureTitle: "Login failed",
  });
}

export function useRegister() {
  return useSessionMutation<Registration>("/api/auth/register", {
    successTitle: "Welcome!",
    successMessage: "Account created successfully",
    failureTitle: "Registration failed",
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => fetchJson<unknown>("/api/auth/logout", { method: "POST" }),
    onSuccess: () => {
      queryClient.setQueryData(authKeys.me, null);
      notifications.show({ title: "Goodbye!", message: "Successfully logged out", color: "blue" });
    },
    onError: () => {
      notifications.show({ title: "Logout failed", message: "Please try again", color: "red" });
    },
  });
}

interface FavoriteChange {
  movieId: string;
  add: boolean;
}

/** Optimistically adds or removes a favorite; returns a no-op for logged-out users. */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationKey: favoritesMutationKey,
    mutationFn: ({ movieId, add }: FavoriteChange) =>
      add
        ? fetchJson<{ favorites: string[] }>("/api/user/favorites", {
            method: "POST",
            body: JSON.stringify({ movieId }),
          })
        : fetchJson<{ favorites: string[] }>(`/api/user/favorites/${movieId}`, {
            method: "DELETE",
          }),
    onMutate: async ({ movieId, add }) => {
      // A profile refetch landing now would overwrite the optimistic change
      await queryClient.cancelQueries({ queryKey: authKeys.me });
      updateFavorites(queryClient, (favorites) => applyFavoriteChange(favorites, movieId, add));
    },
    onSuccess: ({ favorites }) => {
      // With other toggles still in flight the server list is already outdated; the last one syncs
      if (queryClient.isMutating({ mutationKey: favoritesMutationKey }) === 1) {
        updateFavorites(queryClient, () => favorites);
      }
    },
    // Undo only this movie instead of restoring a snapshot, so concurrent toggles are kept
    onError: (_error, { movieId, add }) => {
      updateFavorites(queryClient, (favorites) => applyFavoriteChange(favorites, movieId, !add));
      notifications.show({
        title: "Could not update favorites",
        message: "Please try again",
        color: "red",
      });
    },
  });

  return useCallback(
    (movieId: string) => {
      const user = queryClient.getQueryData<AuthUser | null>(authKeys.me);
      if (!user) return;
      mutate({ movieId, add: !user.favorites.includes(movieId) });
    },
    [queryClient, mutate],
  );
}
