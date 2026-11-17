import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "@/features/auth/api/auth.api";
import { authKeys } from "@/features/auth/api/query-keys";
import { notifyError, notifyInfo } from "@/shared/lib/notify";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(authKeys.me, null);
      notifyInfo("Goodbye!", "Successfully logged out");
    },
    onError: () => notifyError("Logout failed", "Please try again"),
  });
}
