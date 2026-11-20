import type { ReactNode } from "react";
import { Group, Title, type TitleOrder } from "@mantine/core";

interface SectionTitleProps {
  icon: ReactNode;
  children: ReactNode;
  size?: string;
  /** 1 for the page heading, 2 (default) for a section within a page. */
  order?: TitleOrder;
}

/** An icon followed by a heading, used for page titles and above movie rows and grids. */
export function SectionTitle({ icon, children, size = "xl", order = 2 }: SectionTitleProps) {
  return (
    <Group gap={8} align="center" mb="md">
      {icon}
      <Title order={order} size={size} fw={700} c="white">
        {children}
      </Title>
    </Group>
  );
}
