import type { ReactNode } from "react";
import { Group, Title } from "@mantine/core";

interface SectionTitleProps {
  icon: ReactNode;
  children: ReactNode;
  size?: string;
}

/** An icon followed by a section heading, used above movie rows and grids. */
export function SectionTitle({ icon, children, size = "xl" }: SectionTitleProps) {
  return (
    <Group gap={8} align="center" mb="md">
      {icon}
      <Title order={2} size={size} fw={700} c="white">
        {children}
      </Title>
    </Group>
  );
}
