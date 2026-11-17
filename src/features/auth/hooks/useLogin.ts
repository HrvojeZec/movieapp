import { useSessionMutation } from "@/features/auth/hooks/useSessionMutation";
import type { Credentials } from "@/features/auth/types";

export function useLogin() {
  return useSessionMutation<Credentials>("/api/auth/login", {
    successTitle: "Welcome back!",
    successMessage: "Successfully logged in",
    failureTitle: "Login failed",
  });
}
