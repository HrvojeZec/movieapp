import { Button, Group, List, Modal, Stack, Text } from "@mantine/core";
import { X } from "lucide-react";
import { FAVORITES_LIMIT, FEATURE_LABELS, PLAN_FEATURES } from "@/features/subscription/constants";
import { getPlanName } from "@/features/subscription/lib/entitlements";
import type { PaidPlan } from "@/features/subscription/types";
import { formatDate } from "@/shared/lib/format";
import { COLORS } from "@/shared/theme/colors";

interface CancelSubscriptionModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirming: boolean;
  plan: PaidPlan;
  /** The end of the paid period: the plan stays until then. */
  periodEnd: string;
}

/** Spells out what canceling takes away and when, before anything changes. */
export function CancelSubscriptionModal({
  opened,
  onClose,
  onConfirm,
  confirming,
  plan,
  periodEnd,
}: CancelSubscriptionModalProps) {
  const planName = getPlanName(plan);

  return (
    <Modal opened={opened} onClose={onClose} title={`Cancel ${planName}?`} centered>
      <Stack gap="md">
        <Text size="sm" c="gray.3">
          You keep {planName} until {formatDate(periodEnd)}. After that your account moves to the
          free Basic plan and you lose:
        </Text>
        <List size="sm" spacing={4} icon={<X size={14} color={COLORS.danger} />}>
          {PLAN_FEATURES[plan].map((feature) => (
            <List.Item key={feature}>{FEATURE_LABELS[feature]}</List.Item>
          ))}
          <List.Item>Unlimited favorites (Basic keeps up to {FAVORITES_LIMIT})</List.Item>
        </List>
        <Text size="sm" c="dimmed">
          You won&apos;t be charged again, and you can resume any time before{" "}
          {formatDate(periodEnd)}.
        </Text>
        <Group justify="flex-end" gap="sm" mt="xs">
          <Button variant="default" onClick={onClose} disabled={confirming}>
            Keep {planName}
          </Button>
          <Button color="red" onClick={onConfirm} loading={confirming}>
            Cancel subscription
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
