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
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AuthFormProps {
  type: "login" | "register";
}

export const AuthForm = ({ type }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const { login, register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      let result;
      if (type === "login") {
        result = await login(email, password);
      } else {
        result = await register(email, password, name);
      }

      if (result.success) {
        router.push("/");
      } else if (result.error) {
        setError(result.error.message);
        if (result.error.errors) {
          const errors: { [key: string]: string } = {};
          result.error.errors.forEach((err: any) => {
            errors[err.field] = err.message;
          });
          setFieldErrors(errors);
        }
      }
    } finally {
      setLoading(false);
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
            {error && (
              <Alert
                icon={<AlertCircle size={16} />}
                color="red"
                variant="light"
                title="Error"
              >
                {error}
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
              loading={loading}
              size="md"
              className="gradient-bg"
            >
              {type === "login" ? "Sign In" : "Create Account"}
            </Button>
          </Stack>
        </form>

        <Text ta="center" mt="md" c="dimmed">
          {type === "login"
            ? "Don't have an account? "
            : "Already have an account? "}
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
