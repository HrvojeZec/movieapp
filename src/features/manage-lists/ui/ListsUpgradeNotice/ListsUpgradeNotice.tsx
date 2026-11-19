import { Alert, Group, Text } from "@mantine/core";
import { Lock } from "lucide-react";
import { ROUTES } from "@/shared/routes";
import { LinkButton } from "@/shared/ui/LinkButton/LinkButton";

/** For lists kept after a downgrade: they stay readable, changes need Premium again. */
export function ListsUpgradeNotice() {
  return (
    <Alert icon={<Lock size={18} />} color="blue" variant="light">
      <Group justify="space-between" gap="sm">
        <Text size="sm">
          Your lists are kept on the free plan, and you can still remove movies or delete lists.
          Creating lists and adding movies needs Premium.
        </Text>
        <LinkButton href={ROUTES.pricing} size="xs">
          See Premium
        </LinkButton>
      </Group>
    </Alert>
  );
}
