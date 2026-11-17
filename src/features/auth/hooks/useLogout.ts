import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { authKeys } from "@/features/auth/api/queries";
import { fetchJson } from "@/shared/lib/http";

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
