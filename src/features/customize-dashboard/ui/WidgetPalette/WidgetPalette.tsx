"use client";
import { Button, Drawer, Group, Paper, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { Plus, type LucideIcon } from "lucide-react";
import { WIDGET_TYPES } from "@/entities/stats/constants";
import type { LayoutItem, WidgetType } from "@/entities/stats/types";

/** What the palette shows for a widget: its name, one line about it and its icon. */
export interface PaletteWidget {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface WidgetPaletteProps {
  opened: boolean;
  onClose: () => void;
  layout: LayoutItem[];
  onAdd: (type: WidgetType) => void;
  widgets: Record<WidgetType, PaletteWidget>;
}

/** The widgets that aren't on the board yet, one of each kind. */
export function WidgetPalette({ opened, onClose, layout, onAdd, widgets }: WidgetPaletteProps) {
  const missing = WIDGET_TYPES.filter((type) => !layout.some((item) => item.type === type));

  return (
    <Drawer opened={opened} onClose={onClose} position="right" title="Widgets">
      {missing.length === 0 ? (
        <Text c="dimmed" size="sm">
          Every widget is on your board. Remove one to add it again later.
        </Text>
      ) : (
        <Stack gap="sm">
          {missing.map((type) => {
            const { title, description, icon: Icon } = widgets[type];
            return (
              <Paper key={type} p="md">
                <Group justify="space-between" wrap="nowrap" align="flex-start">
                  <Group gap="sm" wrap="nowrap" align="flex-start">
                    <ThemeIcon variant="light" radius="md">
                      <Icon size={16} />
                    </ThemeIcon>
                    <div>
                      <Title order={3} size="h6" c="white">
                        {title}
                      </Title>
                      <Text size="sm" c="dimmed">
                        {description}
                      </Text>
                    </div>
                  </Group>
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<Plus size={14} />}
                    aria-label={`Add ${title}`}
                    onClick={() => onAdd(type)}
                  >
                    Add
                  </Button>
                </Group>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Drawer>
  );
}
