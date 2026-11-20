import { register } from "@/entities/user/api/auth.api";
import { useSessionMutation } from "@/features/auth/hooks/useSessionMutation";

export function useRegister() {
  return useSessionMutation(register, {
    successTitle: "Welcome!",
    successMessage: "Account created successfully",
    failureTitle: "Registration failed",
  });
}
