"use client";
import { useState } from "react";
import {
  Button,
  Center,
  Container,
  Group,
  Loader,
  Modal,
  Stack,
  Text,
  VisuallyHidden,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { BarChart3, Check, Plus, RotateCcw, SlidersHorizontal } from "lucide-react";
import { ProtectedRoute } from "@/features/auth/ui/ProtectedRoute/ProtectedRoute";
import { useDashboardLayout, type SaveStatus } from "@/features/stats/hooks/useDashboardLayout";
import { useUserStats } from "@/features/stats/hooks/useUserStats";
import { addWidget } from "@/features/stats/lib/grid-layout";
import type { WidgetType } from "@/features/stats/types";
import { DashboardGrid } from "@/features/stats/ui/DashboardGrid/DashboardGrid";
import { WidgetPalette } from "@/features/stats/ui/WidgetPalette/WidgetPalette";
import { LockedFeature } from "@/features/subscription/ui/LockedFeature/LockedFeature";
import { COLORS } from "@/shared/theme/colors";
import { QueryError } from "@/shared/ui/QueryError/QueryError";
import { SectionTitle } from "@/shared/ui/SectionTitle/SectionTitle";

export function StatsView() {
  return (
    <ProtectedRoute>
      <Container size="xl" py="xl">
        <LockedFeature feature="stats" title="Your stats">
          <StatsContent />
        </LockedFeature>
      </Container>
    </ProtectedRoute>
  );
}

function StatsContent() {
  const stats = useUserStats();
  const board = useDashboardLayout();
  const [editing, setEditing] = useState(false);
  const [paletteOpened, palette] = useDisclosure(false);
  const [resetOpened, resetConfirm] = useDisclosure(false);
  const { layout, setLayout, flush, status, retry, reset } = board;

  const finishEditing = () => {
    flush();
    setEditing(false);
  };
  const add = (type: WidgetType) => {
    if (layout) setLayout(addWidget(layout, type));
  };
  const confirmReset = () => {
    reset();
    resetConfirm.close();
  };

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="center" gap="sm">
        <SectionTitle icon={<BarChart3 color={COLORS.primary} size={28} />} order={1} size="2rem">
          Your Stats
        </SectionTitle>
        {layout && stats.data && (
          <Group gap="xs" mb="md">
            <SaveState status={status} onRetry={retry} />
            {editing ? (
              <>
                <Button variant="default" leftSection={<Plus size={16} />} onClick={palette.open}>
                  Add widget
                </Button>
                <Button
                  variant="default"
                  leftSection={<RotateCcw size={16} />}
                  onClick={resetConfirm.open}
                >
                  Reset layout
                </Button>
                <Button leftSection={<Check size={16} />} onClick={finishEditing}>
                  Done
                </Button>
              </>
            ) : (
              <Button
                variant="light"
                leftSection={<SlidersHorizontal size={16} />}
                onClick={() => setEditing(true)}
              >
                Customize
              </Button>
            )}
          </Group>
        )}
      </Group>
      {/* Outside the button row: an always-present live region would take a slot in it */}
      <VisuallyHidden aria-live="polite">{SAVE_ANNOUNCEMENTS[status]}</VisuallyHidden>

      {stats.isError || board.isError ? (
        <QueryError
          message="Your stats couldn't be loaded."
          onRetry={() => {
            if (stats.isError) stats.refetch();
            if (board.isError) board.refetch();
          }}
        />
      ) : stats.isPending || board.isPending || !layout ? (
        <Center py="xl">
          <Loader size="sm" />
        </Center>
      ) : (
        <DashboardGrid layout={layout} stats={stats.data} editing={editing} onChange={setLayout} />
      )}

      {layout && (
        <WidgetPalette opened={paletteOpened} onClose={palette.close} layout={layout} onAdd={add} />
      )}
      <Modal opened={resetOpened} onClose={resetConfirm.close} title="Reset the layout?">
        <Stack gap="md">
          <Text size="sm">Every widget goes back to its default place and size.</Text>
          <Group justify="flex-end" gap="xs">
            <Button variant="default" onClick={resetConfirm.close}>
              Cancel
            </Button>
            <Button color="red" onClick={confirmReset}>
              Reset
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

const SAVE_ANNOUNCEMENTS: Record<SaveStatus, string> = {
  idle: "",
  saving: "Saving…",
  saved: "Saved",
  error: "Couldn't save your layout",
};

// The visible status; screen readers hear SAVE_ANNOUNCEMENTS from a separate live region
function SaveState({ status, onRetry }: { status: SaveStatus; onRetry: () => void }) {
  if (status === "idle") return null;
  if (status === "error") {
    return (
      <Group gap={6}>
        <Text size="sm" c="red.4" aria-hidden>
          Couldn&apos;t save
        </Text>
        <Button size="compact-sm" variant="subtle" onClick={onRetry}>
          Retry
        </Button>
      </Group>
    );
  }
  return (
    <Text size="sm" c="dimmed" aria-hidden>
      {SAVE_ANNOUNCEMENTS[status]}
    </Text>
  );
}
