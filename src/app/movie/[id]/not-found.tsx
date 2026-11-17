import { Group } from "@mantine/core";
import { ROUTES } from "@/shared/routes";
import { LinkButton } from "@/shared/ui/LinkButton/LinkButton";
import { StatusPage } from "@/shared/ui/StatusPage/StatusPage";

export default function MovieNotFound() {
  return (
    <StatusPage
      code="404"
      title="Movie not found"
      message="This movie doesn't exist on TMDB, or the link is broken."
      actions={
        <Group>
          <LinkButton href={ROUTES.mostWatched}>Browse movies</LinkButton>
          <LinkButton href={ROUTES.search()} variant="outline">
            Search movies
          </LinkButton>
        </Group>
      }
    />
  );
}
