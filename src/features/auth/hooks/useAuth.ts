import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authKeys, currentUserQuery } from "@/features/auth/api/queries";

export function useAuth() {
  const queryClient = useQueryClient();
  const { data, isPending } = useQuery(currentUserQuery);

  const refreshUser = useCallback(
    () => queryClient.invalidateQueries({ queryKey: authKeys.me }),
    [queryClient],
  );

  return { user: data ?? null, loading: isPending, refreshUser };
}
