import type { ReactNode } from "react";
import { Center, Container, Stack, Text, Title } from "@mantine/core";

const CODE_FONT_SIZE = 72;

interface StatusPageProps {
  /** Large label above the title, e.g. "404". */
  code?: string;
  title: string;
  message: string;
  actions: ReactNode;
}

/** Full-page message for "not found" and error states, with ways to move on. */
export function StatusPage({ code, title, message, actions }: StatusPageProps) {
  return (
    <Container size="sm" py="xl">
      <Center mih="50vh">
        <Stack align="center" gap="md" ta="center">
          {code && (
            <Text fz={CODE_FONT_SIZE} fw={800} c="dimmed" lh={1}>
              {code}
            </Text>
          )}
          <Title order={1} size="2rem" c="white">
            {title}
          </Title>
          <Text c="dimmed" size="lg" maw={480}>
            {message}
          </Text>
          {actions}
        </Stack>
      </Center>
    </Container>
  );
}
