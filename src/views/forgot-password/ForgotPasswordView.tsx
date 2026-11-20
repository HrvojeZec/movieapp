"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Alert, Anchor, Button, Stack, Text, TextInput } from "@mantine/core";
import { useMounted } from "@mantine/hooks";
import { AlertCircle, MailCheck } from "lucide-react";
import { useForgotPassword } from "@/features/auth/hooks/useForgotPassword";
import { authInputClassNames } from "@/features/auth/ui/AuthForm/AuthForm";
import { AuthLayout } from "@/features/auth/ui/AuthLayout/AuthLayout";
import { toApiError } from "@/shared/lib/api-error";
import { ROUTES } from "@/shared/routes";

export function ForgotPasswordView() {
  const [email, setEmail] = useState("");
  const request = useForgotPassword();
  const interactive = useMounted();
  const error = request.error ? toApiError(request.error) : null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    request.mutate(email);
  };

  return (
    <AuthLayout title="Forgot password?" subtitle="We'll email you a link to choose a new one">
      {request.isSuccess ? (
        <Stack gap="md">
          <Alert
            icon={<MailCheck size={16} />}
            color="green"
            variant="light"
            title="Check your inbox"
          >
            {request.data.message} The link works once and expires in 1 hour.
          </Alert>
          <Text size="sm" c="dimmed">
            Nothing after a few minutes? Check your spam folder, or{" "}
            <Anchor component="button" type="button" size="sm" onClick={() => request.reset()}>
              try again
            </Anchor>
            .
          </Text>
        </Stack>
      ) : (
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {error && (
              <Alert icon={<AlertCircle size={16} />} color="red" variant="light">
                {error.message}
              </Alert>
            )}
            <TextInput
              label="Email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              error={error?.errors?.find((err) => err.field === "email")?.message}
              classNames={authInputClassNames}
            />
            <Button
              type="submit"
              fullWidth
              size="md"
              loading={request.isPending}
              disabled={!interactive}
            >
              Send reset link
            </Button>
          </Stack>
        </form>
      )}

      <Text ta="center" mt="md" c="dimmed">
        Remembered it?{" "}
        <Anchor component={Link} href={ROUTES.login} c="blue">
          Back to sign in
        </Anchor>
      </Text>
    </AuthLayout>
  );
}
