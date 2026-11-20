"use client";
import Link from "next/link";
import { Alert, Anchor, Button, Group, PasswordInput, Stack, Text, TextInput } from "@mantine/core";
import { useMounted } from "@mantine/hooks";
import { AlertCircle } from "lucide-react";
import { useAuthForm, type AuthFormType } from "@/features/auth/hooks/useAuthForm";
import { AuthLayout } from "@/features/auth/ui/AuthLayout/AuthLayout";
import { ROUTES } from "@/shared/routes";
import classes from "./AuthForm.module.scss";

export const authInputClassNames = { input: classes.input, label: classes.label };

const COPY = {
  login: {
    title: "Welcome Back",
    subtitle: "Sign in to keep your favorites in sync",
    submit: "Sign In",
    switchPrompt: "Don't have an account? ",
    switchLabel: "Sign up",
    switchHref: ROUTES.register,
  },
  register: {
    title: "Create Account",
    subtitle: "Save favorites and pick up where you left off",
    submit: "Create Account",
    switchPrompt: "Already have an account? ",
    switchLabel: "Sign in",
    switchHref: ROUTES.login,
  },
} as const;

export const AuthForm = ({ type }: { type: AuthFormType }) => {
  const { values, setField, handleSubmit, submitting, error, fieldErrors } = useAuthForm(type);
  // Until React hydrates the form, a submit would be lost (or sent natively with the password in
  // the URL), so the button only becomes active once the page is interactive
  const interactive = useMounted();
  const copy = COPY[type];

  return (
    <AuthLayout title={copy.title} subtitle={copy.subtitle}>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {error && (
            <Alert icon={<AlertCircle size={16} />} color="red" variant="light" title="Error">
              {error.message}
            </Alert>
          )}

          {type === "register" && (
            <TextInput
              label="Full Name"
              placeholder="Your name"
              value={values.name}
              onChange={(e) => setField("name")(e.target.value)}
              required
              error={fieldErrors.name}
              classNames={authInputClassNames}
            />
          )}

          <TextInput
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={values.email}
            onChange={(e) => setField("email")(e.target.value)}
            required
            error={fieldErrors.email}
            classNames={authInputClassNames}
          />

          <Stack gap={6}>
            <PasswordInput
              label="Password"
              placeholder="Password"
              value={values.password}
              onChange={(e) => setField("password")(e.target.value)}
              required
              error={fieldErrors.password}
              classNames={authInputClassNames}
            />
            {type === "login" && (
              <Group justify="flex-end">
                <Anchor component={Link} href={ROUTES.forgotPassword} size="sm" c="blue">
                  Forgot password?
                </Anchor>
              </Group>
            )}
          </Stack>

          <Button type="submit" fullWidth loading={submitting} disabled={!interactive} size="md">
            {copy.submit}
          </Button>
        </Stack>
      </form>

      <Text ta="center" mt="md" c="dimmed">
        {copy.switchPrompt}
        <Anchor component={Link} href={copy.switchHref} c="blue">
          {copy.switchLabel}
        </Anchor>
      </Text>
    </AuthLayout>
  );
};
