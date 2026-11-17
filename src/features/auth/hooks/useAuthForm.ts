import { useState, type FormEvent } from "react";
import { useAppRouter } from "@/shared/hooks/useAppRouter";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { useRegister } from "@/features/auth/hooks/useRegister";
import { toApiError } from "@/shared/lib/api-error";
import { ROUTES } from "@/shared/routes";

export type AuthFormType = "login" | "register";

/** Field values, submission and server errors (overall and per field) of the auth form. */
export function useAuthForm(type: AuthFormType) {
  const [values, setValues] = useState({ email: "", password: "", name: "" });
  const login = useLogin();
  const register = useRegister();
  const router = useAppRouter();

  const mutation = type === "login" ? login : register;
  const error = mutation.error ? toApiError(mutation.error) : null;
  const fieldErrors: Record<string, string> = {};
  // Show the first error per field; later ones are usually follow-ups of the same problem.
  for (const err of error?.errors ?? []) {
    fieldErrors[err.field] ??= err.message;
  }

  const setField = (field: keyof typeof values) => (value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const onSuccess = () => router.push(ROUTES.home);
    const { email, password, name } = values;

    if (type === "login") {
      login.mutate({ email, password }, { onSuccess });
    } else {
      register.mutate({ email, password, name }, { onSuccess });
    }
  };

  return {
    values,
    setField,
    handleSubmit,
    submitting: mutation.isPending,
    error,
    fieldErrors,
  };
}
