import type { Metadata } from "next";
import { Group } from "@mantine/core";
import { ROUTES } from "@/shared/routes";
import { LinkButton } from "@/shared/ui/LinkButton/LinkButton";
import { StatusPage } from "@/shared/ui/StatusPage/StatusPage";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      title="Page not found"
      message="The page you're looking for doesn't exist or has moved."
      actions={
        <Group>
          <LinkButton href={ROUTES.home}>Go home</LinkButton>
          <LinkButton href={ROUTES.search()} variant="outline">
            Search movies
          </LinkButton>
        </Group>
      }
    />
  );
}
