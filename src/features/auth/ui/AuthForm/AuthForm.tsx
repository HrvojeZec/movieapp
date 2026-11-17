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
import { AlertCircle } from "lucide-react";
import { useAuthForm, type AuthFormType } from "@/features/auth/hooks/useAuthForm";
import { ROUTES } from "@/shared/routes";
import classes from "./AuthForm.module.scss";

const inputClassNames = { input: classes.input, label: classes.label };

const COPY = {
  login: {
    title: "Welcome Back",
    submit: "Sign In",
    switchPrompt: "Don't have an account? ",
    switchLabel: "Sign up",
    switchHref: ROUTES.register,
  },
  register: {
    title: "Create Account",
    submit: "Create Account",
    switchPrompt: "Already have an account? ",
    switchLabel: "Sign in",
    switchHref: ROUTES.login,
  },
} as const;

export const AuthForm = ({ type }: { type: AuthFormType }) => {
  const { values, setField, handleSubmit, submitting, error, fieldErrors } = useAuthForm(type);
  const copy = COPY[type];

  return (
    <Container size="xs" py="xl">
      <Title ta="center" c="white" mb="xl" data-aos="fade-down">
        {copy.title}
      </Title>

      <Paper data-aos="fade-up" data-aos-delay="300" shadow="md" p="xl" radius="md">
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

            <Button type="submit" fullWidth loading={submitting} size="md">
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
  );
};
