"use client";
import Link from "next/link";
import {
  Alert,
  Anchor,
  Button,
  Container,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useMounted } from "@mantine/hooks";
import { AlertCircle } from "lucide-react";
import { useAuthForm, type AuthFormType } from "@/features/auth/hooks/useAuthForm";
import { AuthBackground } from "@/features/auth/ui/AuthBackground/AuthBackground";
import { ROUTES } from "@/shared/routes";
import BlurText from "@/shared/vendor/react-bits/BlurText/BlurText";
import classes from "./AuthForm.module.scss";

const inputClassNames = { input: classes.input, label: classes.label };
// Words of the subtitle come into focus one after another
const SUBTITLE_WORD_DELAY_MS = 60;

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
    <div className={classes.stage}>
      <AuthBackground />
      <Container size="xs" py="xl" className={classes.content}>
        <Title ta="center" c="white" mb="xs">
          {copy.title}
        </Title>
        <BlurText
          key={type}
          text={copy.subtitle}
          className={classes.subtitle}
          delay={SUBTITLE_WORD_DELAY_MS}
          trigger="load"
        />

        <Paper shadow="md" p="xl" radius="md">
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
                  classNames={inputClassNames}
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
                classNames={inputClassNames}
              />

              <PasswordInput
                label="Password"
                placeholder="Password"
                value={values.password}
                onChange={(e) => setField("password")(e.target.value)}
                required
                error={fieldErrors.password}
                classNames={inputClassNames}
              />

              <Button
                type="submit"
                fullWidth
                loading={submitting}
                disabled={!interactive}
                size="md"
              >
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
        </Paper>
      </Container>
    </div>
  );
};
