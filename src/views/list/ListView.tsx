"use client";
import {
  ActionIcon,
  Button,
  Center,
  Container,
  Group,
  Loader,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { ArrowDownUp, ArrowLeft, Check, Pencil, Trash2, X } from "lucide-react";
import { ProtectedRoute } from "@/entities/user/ui/ProtectedRoute/ProtectedRoute";
import { useList } from "@/entities/movie-list/hooks/useList";
import { useListMutations } from "@/features/lists/hooks/useListMutations";
import { ListNameModal } from "@/features/lists/ui/ListNameModal/ListNameModal";
import { ListsUpgradeNotice } from "@/features/lists/ui/ListsUpgradeNotice/ListsUpgradeNotice";
import { ReorderList } from "@/features/lists/ui/ReorderList/ReorderList";
import { GRID_COLUMNS } from "@/entities/movie/constants";
import { useMoviesByIds } from "@/entities/movie/hooks/useMoviesByIds";
import { MovieCard } from "@/entities/movie/ui/MovieCard/MovieCard";
import { MovieGrid } from "@/features/movies/ui/MovieGrid/MovieGrid";
import { useEntitlements } from "@/entities/user/hooks/useEntitlements";
import { useAppRouter } from "@/shared/hooks/useAppRouter";
import { pluralize } from "@/shared/lib/format";
import { HttpError } from "@/shared/lib/http";
import { HTTP_STATUS } from "@/shared/lib/http-status";
import { ROUTES } from "@/shared/routes";
import { LinkButton } from "@/shared/ui/LinkButton/LinkButton";
import { QueryError } from "@/shared/ui/QueryError/QueryError";
import { StatusPage } from "@/shared/ui/StatusPage/StatusPage";
import { SwipeToRemove } from "@/shared/ui/SwipeToRemove/SwipeToRemove";
import { showUndoNotice } from "@/shared/ui/SwipeToRemove/undo-notice";

export function ListView({ listId }: { listId: string }) {
  return (
    <ProtectedRoute>
      <ListContent listId={listId} />
    </ProtectedRoute>
  );
}

function ListContent({ listId }: { listId: string }) {
  const { data: list, isPending, error, refetch } = useList(listId);
  const { can } = useEntitlements();
  const { rename, remove, toggleMovie, reorder } = useListMutations();
  const [reordering, setReordering] = useState(false);
  const router = useAppRouter();
  const [renameOpened, renameModal] = useDisclosure(false);
  const [deleteOpened, deleteModal] = useDisclosure(false);
  // Saved in the order shown: new movies go to the top, and the user can rearrange them
  const movieIds = list?.movieIds ?? [];
  const { movies, isPending: moviesPending } = useMoviesByIds(movieIds.map(Number));
  const canEdit = can("customLists");

  const removeWithUndo = (movieId: string, title: string) => {
    const previousOrder = movieIds;
    toggleMovie.mutate({ listId, movieId, add: false });
    showUndoNotice({
      title: "Removed from the list",
      message: title,
      // Adding needs the plan; it lands on top, so the old order is put back after it
      onUndo: canEdit
        ? () =>
            toggleMovie.mutate(
              { listId, movieId, add: true },
              { onSuccess: () => reorder.mutate({ listId, movieIds: previousOrder }) },
            )
        : undefined,
    });
  };

  if (error instanceof HttpError && error.status === HTTP_STATUS.NOT_FOUND) {
    return (
      <StatusPage
        code="404"
        title="List not found"
        message="It may have been deleted, or the link is wrong."
        actions={<LinkButton href={ROUTES.lists}>Back to your lists</LinkButton>}
      />
    );
  }

  return (
    <Container size="xl" py="xl">
      {isPending ? (
        <Center py="xl">
          <Loader size="sm" />
        </Center>
      ) : !list ? (
        <QueryError message="This list couldn't be loaded." onRetry={refetch} />
      ) : (
        <Stack gap="xl">
          <Stack gap={4}>
            <LinkButton
              href={ROUTES.lists}
              variant="subtle"
              size="compact-sm"
              leftSection={<ArrowLeft size={14} />}
              w="fit-content"
            >
              My Lists
            </LinkButton>
            <Group justify="space-between" align="flex-end">
              <div>
                <Title order={1} size="2rem" c="white">
                  {list.name}
                </Title>
                <Text c="dimmed">
                  {list.movieIds.length} {pluralize(list.movieIds.length, "movie")}
                </Text>
              </div>
              <Group gap="xs">
                {canEdit && movieIds.length > 1 && (
                  <Button
                    variant={reordering ? "filled" : "default"}
                    leftSection={reordering ? <Check size={16} /> : <ArrowDownUp size={16} />}
                    onClick={() => setReordering((on) => !on)}
                  >
                    {reordering ? "Done" : "Reorder"}
                  </Button>
                )}
                {canEdit && (
                  <Tooltip label="Rename list">
                    <ActionIcon
                      variant="default"
                      size="lg"
                      onClick={renameModal.open}
                      aria-label="Rename list"
                    >
                      <Pencil size={16} />
                    </ActionIcon>
                  </Tooltip>
                )}
                <Tooltip label="Delete list">
                  <ActionIcon
                    variant="default"
                    size="lg"
                    color="red"
                    onClick={deleteModal.open}
                    aria-label="Delete list"
                  >
                    <Trash2 size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
          </Stack>

          {!canEdit && <ListsUpgradeNotice />}

          {movieIds.length === 0 ? (
            <Text c="dimmed" ta="center" size="lg" mt="xl">
              This list is empty. Use &ldquo;Add to list&rdquo; on a movie page to fill it.
            </Text>
          ) : reordering ? (
            <ReorderList
              movieIds={movieIds}
              movies={movies}
              onCommit={(order) => reorder.mutate({ listId, movieIds: order })}
            />
          ) : moviesPending && movies.length === 0 ? (
            <MovieGrid movies={[]} loading />
          ) : (
            <SimpleGrid cols={GRID_COLUMNS} spacing="lg">
              {movies.map((movie) => (
                <Stack key={movie.id} gap={6}>
                  <SwipeToRemove
                    label="Remove"
                    onRemove={() => removeWithUndo(String(movie.id), movie.title)}
                  >
                    <MovieCard movie={movie} />
                  </SwipeToRemove>
                  <Button
                    variant="subtle"
                    color="gray"
                    size="compact-xs"
                    leftSection={<X size={12} />}
                    disabled={toggleMovie.isPending}
                    onClick={() =>
                      toggleMovie.mutate({ listId, movieId: String(movie.id), add: false })
                    }
                    aria-label={`Remove ${movie.title} from this list`}
                  >
                    Remove
                  </Button>
                </Stack>
              ))}
            </SimpleGrid>
          )}

          <ListNameModal
            opened={renameOpened}
            onClose={renameModal.close}
            title="Rename list"
            submitLabel="Save"
            initialName={list.name}
            submitting={rename.isPending}
            onSubmit={(name) => rename.mutate({ listId, name }, { onSuccess: renameModal.close })}
          />

          <Modal opened={deleteOpened} onClose={deleteModal.close} title="Delete list?" centered>
            <Stack gap="md">
              <Text size="sm" c="gray.3">
                &ldquo;{list.name}&rdquo; and its {list.movieIds.length}{" "}
                {pluralize(list.movieIds.length, "movie")} will be gone. The movies themselves stay
                in your favorites, watchlist and history.
              </Text>
              <Group justify="flex-end" gap="sm">
                <Button variant="default" onClick={deleteModal.close} disabled={remove.isPending}>
                  Keep list
                </Button>
                <Button
                  color="red"
                  loading={remove.isPending}
                  onClick={() =>
                    remove.mutate(listId, { onSuccess: () => router.push(ROUTES.lists) })
                  }
                >
                  Delete list
                </Button>
              </Group>
            </Stack>
          </Modal>
        </Stack>
      )}
    </Container>
  );
}
