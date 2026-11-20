import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "@/entities/user/api/auth.api";
import { authKeys } from "@/entities/user/api/query-keys";
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
