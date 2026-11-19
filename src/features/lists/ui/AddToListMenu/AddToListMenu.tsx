"use client";
import { Button, Loader, Menu, Text, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Check, ListPlus, Lock, Plus } from "lucide-react";
import { useAuth } from "@/entities/user/hooks/useAuth";
import { useListMutations } from "@/features/lists/hooks/useListMutations";
import { useLists } from "@/entities/movie-list/hooks/useLists";
import { ListNameModal } from "@/features/lists/ui/ListNameModal/ListNameModal";
import { useEntitlements } from "@/entities/user/hooks/useEntitlements";
import { useAppRouter } from "@/shared/hooks/useAppRouter";
import { notifySuccess } from "@/shared/lib/notify";
import { ROUTES } from "@/shared/routes";

const MENU_WIDTH = 240;

/**
 * "Add to list" on the movie page: ticks the lists that hold the movie and creates a new one with
 * it. A free account sees it locked, leading to pricing.
 */
export function AddToListMenu({ movieId }: { movieId: number | string }) {
  const id = String(movieId);
  const { user, loading } = useAuth();
  const { can } = useEntitlements();
  const router = useAppRouter();
  const [menuOpened, menu] = useDisclosure(false);
  const [modalOpened, modal] = useDisclosure(false);
  const { data: lists, isPending } = useLists({ movieId: id, enabled: menuOpened });
  const { create, toggleMovie } = useListMutations();

  if (!user) return null;

  if (!can("customLists")) {
    return (
      <Tooltip label="Lists come with Premium">
        <Button
          variant="default"
          leftSection={<Lock size={16} />}
          onClick={() => router.push(ROUTES.pricing)}
          disabled={loading}
        >
          Add to list
        </Button>
      </Tooltip>
    );
  }

  const createWithMovie = (name: string) =>
    create.mutate(
      { name, movieId: id },
      {
        onSuccess: (list) => {
          modal.close();
          notifySuccess("List created", `Added to ${list.name}`);
        },
      },
    );

  return (
    <>
      <Menu
        opened={menuOpened}
        onChange={(opened) => (opened ? menu.open() : menu.close())}
        width={MENU_WIDTH}
        shadow="md"
        closeOnItemClick={false}
      >
        <Menu.Target>
          <Button variant="default" leftSection={<ListPlus size={16} />}>
            Add to list
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Your lists</Menu.Label>
          {isPending ? (
            <Menu.Item disabled leftSection={<Loader size={14} />}>
              Loading…
            </Menu.Item>
          ) : lists && lists.length > 0 ? (
            lists.map((list) => (
              <Menu.Item
                key={list.id}
                // The tick alone is invisible to screen readers
                aria-label={list.hasMovie ? `${list.name} (added)` : list.name}
                rightSection={list.hasMovie ? <Check size={16} /> : null}
                disabled={toggleMovie.isPending}
                onClick={() =>
                  toggleMovie.mutate({ listId: list.id, movieId: id, add: !list.hasMovie })
                }
              >
                <Text size="sm" truncate>
                  {list.name}
                </Text>
              </Menu.Item>
            ))
          ) : (
            <Text size="sm" c="dimmed" px="sm" py={6}>
              No lists yet
            </Text>
          )}
          <Menu.Divider />
          <Menu.Item
            leftSection={<Plus size={16} />}
            onClick={() => {
              menu.close();
              modal.open();
            }}
          >
            New list
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <ListNameModal
        opened={modalOpened}
        onClose={modal.close}
        title="New list"
        submitLabel="Create and add"
        submitting={create.isPending}
        onSubmit={createWithMovie}
      />
    </>
  );
}
