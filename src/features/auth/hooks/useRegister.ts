import { useSessionMutation } from "@/features/auth/hooks/useSessionMutation";
import type { Registration } from "@/features/auth/types";

export function useRegister() {
  return useSessionMutation<Registration>("/api/auth/register", {
    successTitle: "Welcome!",
    successMessage: "Account created successfully",
    failureTitle: "Registration failed",
  });
}
