import { useMutation } from "@tanstack/react-query";
import { requestPasswordReset } from "@/entities/user/api/auth.api";

/** Asks for a reset link; the answer is the same whether or not the email has an account. */
export function useForgotPassword() {
  return useMutation({ mutationFn: requestPasswordReset });
}
