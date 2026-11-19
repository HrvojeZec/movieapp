"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Alert, Anchor, Button, PasswordInput, Stack, Text } from "@mantine/core";
import { useMounted } from "@mantine/hooks";
import { AlertCircle } from "lucide-react";
import { useResetPassword } from "@/features/auth/hooks/useResetPassword";
import { authInputClassNames } from "@/features/auth/ui/AuthForm/AuthForm";
import { AuthLayout } from "@/features/auth/ui/AuthLayout/AuthLayout";
import { useAppRouter } from "@/shared/hooks/useAppRouter";
import { toApiError } from "@/shared/lib/api-error";
import { notifySuccess } from "@/shared/lib/notify";
import { ROUTES } from "@/shared/routes";

const MISMATCH = "The passwords don't match";

export function ResetPasswordView() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [mismatch, setMismatch] = useState(false);
  const reset = useResetPassword();
  const router = useAppRouter();
  const interactive = useMounted();

  const error = reset.error ? toApiError(reset.error) : null;
  const passwordError = error?.errors?.find((err) => err.field === "password")?.message;
  // Anything else (an invalid, used or expired link) is about the link, not the password
  const linkError = error && !passwordError ? error.message : null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirmation) {
      setMismatch(true);
      return;
    }
    reset.mutate(
      { token, password },
      {
        onSuccess: ({ message }) => {
          notifySuccess("Password changed", message);
          router.push(ROUTES.login);
        },
      },
    );
  };

  return (
    <AuthLayout title="Choose a new password" subtitle="Then sign in with it">
      {!token ? (
        <Alert icon={<AlertCircle size={16} />} color="red" variant="light">
          This link is missing its reset code. Open the link from the email again, or ask for a new
          one.
        </Alert>
      ) : (
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {linkError && (
              <Alert icon={<AlertCircle size={16} />} color="red" variant="light">
                {linkError}. Ask for a new link below.
              </Alert>
            )}
            <PasswordInput
              label="New password"
              placeholder="At least 6 characters, with a number and an uppercase letter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              error={passwordError}
              classNames={authInputClassNames}
            />
            <PasswordInput
              label="Repeat new password"
              value={confirmation}
              onChange={(e) => {
                setConfirmation(e.target.value);
                setMismatch(false);
              }}
              required
              error={mismatch ? MISMATCH : undefined}
              classNames={authInputClassNames}
            />
            <Button
              type="submit"
              fullWidth
              size="md"
              loading={reset.isPending}
              disabled={!interactive}
            >
              Change password
            </Button>
          </Stack>
        </form>
      )}

      <Text ta="center" mt="md" c="dimmed">
        Link not working?{" "}
        <Anchor component={Link} href={ROUTES.forgotPassword} c="blue">
          Get a new one
        </Anchor>
      </Text>
    </AuthLayout>
  );
}
