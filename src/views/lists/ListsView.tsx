"use client";
import { Button, Center, Container, Group, Loader, SimpleGrid, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ListVideo, Plus } from "lucide-react";
import { ProtectedRoute } from "@/features/auth/ui/ProtectedRoute/ProtectedRoute";
import { useListMutations } from "@/features/lists/hooks/useListMutations";
import { useLists } from "@/features/lists/hooks/useLists";
import { ListCard } from "@/features/lists/ui/ListCard/ListCard";
import { ListNameModal } from "@/features/lists/ui/ListNameModal/ListNameModal";
import { ListsUpgradeNotice } from "@/features/lists/ui/ListsUpgradeNotice/ListsUpgradeNotice";
import { useEntitlements } from "@/features/subscription/hooks/useEntitlements";
import { LockedFeature } from "@/features/subscription/ui/LockedFeature/LockedFeature";
import { useAppRouter } from "@/shared/hooks/useAppRouter";
import { ROUTES } from "@/shared/routes";
import { COLORS } from "@/shared/theme/colors";
import { QueryError } from "@/shared/ui/QueryError/QueryError";
import { SectionTitle } from "@/shared/ui/SectionTitle/SectionTitle";
import { Magnetic } from "@/shared/ui/motion/Magnetic";

const LIST_COLUMNS = { base: 1, sm: 2, lg: 3 };

export function ListsView() {
  return (
    <ProtectedRoute>
      <Container size="xl" py="xl">
        <ListsContent />
      </Container>
    </ProtectedRoute>
  );
}

function ListsContent() {
  const { can, loading } = useEntitlements();
  const { data: lists, isPending, isError, refetch } = useLists();
  const [modalOpened, modal] = useDisclosure(false);
  const { create } = useListMutations();
  const router = useAppRouter();
  const canEdit = can("customLists");

  if (loading || isPending) {
    return (
      <Center py="xl">
        <Loader size="sm" />
      </Center>
    );
  }
  if (isError) return <QueryError message="Your lists couldn't be loaded." onRetry={refetch} />;

  // Nothing to keep from an earlier plan: just the upgrade prompt
  if (!canEdit && lists.length === 0) {
    return (
      <LockedFeature feature="customLists" title="Your movie lists">
        {null}
      </LockedFeature>
    );
  }

  const createList = (name: string) =>
    create.mutate({ name }, { onSuccess: (list) => router.push(ROUTES.list(list.id)) });

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <SectionTitle icon={<ListVideo color={COLORS.primary} size={28} />} order={1} size="2rem">
          My Lists ({lists.length})
        </SectionTitle>
        {canEdit && (
          <Magnetic>
            <Button leftSection={<Plus size={16} />} onClick={modal.open}>
              New list
            </Button>
          </Magnetic>
        )}
      </Group>

      {!canEdit && <ListsUpgradeNotice />}

      {lists.length > 0 ? (
        <SimpleGrid cols={LIST_COLUMNS} spacing="lg">
          {lists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </SimpleGrid>
      ) : (
        <Text c="dimmed" ta="center" size="lg" mt="xl">
          No lists yet. Create one here, or use &ldquo;Add to list&rdquo; on a movie page.
        </Text>
      )}

      <ListNameModal
        opened={modalOpened}
        onClose={modal.close}
        title="New list"
        submitLabel="Create list"
        submitting={create.isPending}
        onSubmit={createList}
      />
    </Stack>
  );
}
