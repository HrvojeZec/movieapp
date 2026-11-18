import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "@/features/auth/api/auth.api";

/** Sets a new password with the token from the reset email. */
export function useResetPassword() {
  return useMutation({ mutationFn: resetPassword });
}
