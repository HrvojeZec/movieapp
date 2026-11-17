import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { currentUserQuery } from "@/features/auth/api/queries";
import { authKeys } from "@/features/auth/api/query-keys";

export function useAuth() {
  const queryClient = useQueryClient();
  const { data, isPending } = useQuery(currentUserQuery);

  const refreshUser = useCallback(
    () => queryClient.invalidateQueries({ queryKey: authKeys.me }),
    [queryClient],
  );

  return { user: data ?? null, loading: isPending, refreshUser };
}
