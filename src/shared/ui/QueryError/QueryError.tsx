"use client";
import { Alert, Button, Group, Text } from "@mantine/core";
import { AlertCircle, RotateCw } from "lucide-react";

interface QueryErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function QueryError({
  message = "Something went wrong while loading.",
  onRetry,
}: QueryErrorProps) {
  return (
    <Alert
      icon={<AlertCircle size={18} />}
      color="red"
      variant="light"
      title="Couldn't load this content"
      role="alert"
    >
      <Group justify="space-between" gap="md">
        <Text size="sm">{message}</Text>
        {onRetry && (
          <Button
            size="xs"
            variant="light"
            color="red"
            leftSection={<RotateCw size={14} />}
            onClick={onRetry}
          >
            Try again
          </Button>
        )}
      </Group>
    </Alert>
  );
}
