import { login } from "@/entities/user/api/auth.api";
import { useSessionMutation } from "@/features/auth/hooks/useSessionMutation";

export function useLogin() {
  return useSessionMutation(login, {
    successTitle: "Welcome back!",
    successMessage: "Successfully logged in",
    failureTitle: "Login failed",
  });
}
