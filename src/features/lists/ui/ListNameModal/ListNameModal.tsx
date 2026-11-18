"use client";
import { useState, type FormEvent } from "react";
import { Button, Group, Modal, Stack, TextInput } from "@mantine/core";
import { LIST_NAME_MAX_LENGTH } from "@/features/lists/constants";

interface ListNameModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  submitLabel: string;
  initialName?: string;
  submitting: boolean;
  onSubmit: (name: string) => void;
}

/** Asks for a list's name, when creating or renaming one. */
export function ListNameModal({ opened, onClose, ...form }: ListNameModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title={form.title} centered>
      {/* Mounted only while open, so each opening starts from the current name */}
      {opened && <ListNameForm onCancel={onClose} {...form} />}
    </Modal>
  );
}

function ListNameForm({
  submitLabel,
  initialName = "",
  submitting,
  onSubmit,
  onCancel,
}: Omit<ListNameModalProps, "opened" | "onClose" | "title"> & { onCancel: () => void }) {
  const [name, setName] = useState(initialName);
  const trimmed = name.trim();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (trimmed) onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <TextInput
          label="List name"
          placeholder="e.g. Sunday classics"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={LIST_NAME_MAX_LENGTH}
          data-autofocus
          required
        />
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting} disabled={!trimmed}>
            {submitLabel}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
