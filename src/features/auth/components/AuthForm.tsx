"use client";
import { useState } from "react";
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Anchor,
  Stack,
  Container,
  Alert,
} from "@mantine/core";
import { AlertCircle } from "lucide-react";
import { useLogin, useRegister, toApiError } from "@/features/auth/queries";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AuthFormProps {
  type: "login" | "register";
}

export const AuthForm = ({ type }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const login = useLogin();
  const register = useRegister();
  const router = useRouter();

  const mutation = type === "login" ? login : register;
  const apiError = mutation.error ? toApiError(mutation.error) : null;
  const fieldErrors: Record<string, string> = {};
  // Show the first error per field; later ones are usually follow-ups of the same problem.
  for (const err of apiError?.errors ?? []) {
    fieldErrors[err.field] ??= err.message;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const onSuccess = () => router.push("/");

    if (type === "login") {
      login.mutate({ email, password }, { onSuccess });
    } else {
      register.mutate({ email, password, name }, { onSuccess });
    }
  };

  return (
    <Container size="xs" py="xl">
      <Title ta="center" c="white" mb="xl" data-aos="fade-down">
        {type === "login" ? "Welcome Back" : "Create Account"}
      </Title>

      <Paper
        data-aos="fade-up"
        data-aos-delay="300"
        shadow="md"
        p="xl"
        radius="md"
        bg="dark.7"
        style={{ border: "1px solid rgba(255, 255, 255, 0.1)" }}
      >
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {apiError && (
              <Alert icon={<AlertCircle size={16} />} color="red" variant="light" title="Error">
                {apiError.message}
              </Alert>
            )}

            {type === "register" && (
              <TextInput
                label="Full Name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                error={fieldErrors.name}
                styles={{
                  input: { backgroundColor: "rgba(255, 255, 255, 0.05)" },
                  label: { color: "white" },
                }}
              />
            )}

            <TextInput
              label="Email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              error={fieldErrors.email}
              styles={{
                input: { backgroundColor: "rgba(255, 255, 255, 0.05)" },
                label: { color: "white" },
              }}
            />

            <PasswordInput
              label="Password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              error={fieldErrors.password}
              styles={{
                input: { backgroundColor: "rgba(255, 255, 255, 0.05)" },
                label: { color: "white" },
              }}
            />

            <Button
              type="submit"
              fullWidth
              loading={mutation.isPending}
              size="md"
              className="gradient-bg"
            >
              {type === "login" ? "Sign In" : "Create Account"}
            </Button>
          </Stack>
        </form>

        <Text ta="center" mt="md" c="dimmed">
          {type === "login" ? "Don't have an account? " : "Already have an account? "}
          <Link
            href={type === "login" ? "/auth/register" : "/auth/login"}
            style={{ textDecoration: "none" }}
          >
            <Anchor component="span" c="blue">
              {type === "login" ? "Sign up" : "Sign in"}
            </Anchor>
          </Link>
        </Text>
      </Paper>
    </Container>
  );
};
