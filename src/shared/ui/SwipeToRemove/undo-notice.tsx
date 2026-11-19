import { Button, Group, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { SECOND_MS } from "@/shared/lib/time";

// Long enough to notice a slip of the thumb and take it back
const UNDO_SECONDS = 6;
let nextId = 0;

interface UndoNotice {
  title: string;
  message: string;
  /** Left out when the change can't be taken back (e.g. the plan no longer allows adding). */
  onUndo?: () => void;
}

/** A notification for something just removed, with an Undo button when it can be put back. */
export function showUndoNotice({ title, message, onUndo }: UndoNotice) {
  const id = `undo-${(nextId += 1)}`;
  notifications.show({
    id,
    title,
    autoClose: UNDO_SECONDS * SECOND_MS,
    message: (
      <Group justify="space-between" gap="sm" wrap="nowrap">
        <Text size="sm">{message}</Text>
        {onUndo && (
          <Button
            size="compact-sm"
            variant="light"
            onClick={() => {
              notifications.hide(id);
              onUndo();
            }}
          >
            Undo
          </Button>
        )}
      </Group>
    ),
  });
}
