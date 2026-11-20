"use client";
import { useEffect } from "react";
import { Button, Group } from "@mantine/core";
import { RotateCw } from "lucide-react";
import { ROUTES } from "@/shared/routes";
import { LinkButton } from "@/shared/ui/LinkButton/LinkButton";
import { StatusPage } from "@/shared/ui/StatusPage/StatusPage";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/** Shown when rendering a page throws; the header and footer stay usable. */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      title="Something went wrong"
      message="This page couldn't be loaded. Try again, or come back in a moment."
      actions={
        <Group>
          <Button leftSection={<RotateCw size={16} />} onClick={reset}>
            Try again
          </Button>
          <LinkButton href={ROUTES.home} variant="outline">
            Go home
          </LinkButton>
        </Group>
      }
    />
  );
}
