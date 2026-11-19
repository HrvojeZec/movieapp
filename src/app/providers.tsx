"use client";

import { useState, type ReactNode } from "react";
import { MantineProvider, v8CssVariablesResolver } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { MotionConfig } from "motion/react";
import { Layout } from "@/shell/ui/Layout/Layout";
import { createQueryClient } from "@/shared/lib/query-client";
import { theme } from "@/shared/theme/theme";

// Client-side providers live here so the root layout can stay a Server Component.
export function Providers({ children }: { children: ReactNode }) {
  // One client per browser session; useState keeps it stable across re-renders
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Mantine 9 made light and subtle variants solid; keep the translucent 8.x colors */}
      <MantineProvider
        theme={theme}
        defaultColorScheme="dark"
        cssVariablesResolver={v8CssVariablesResolver}
      >
        <Notifications position="top-right" />
        {/* "user": animations are reduced when the OS asks for reduced motion */}
        <MotionConfig reducedMotion="user">
          <Layout>{children}</Layout>
        </MotionConfig>
      </MantineProvider>
      {/* Renders nothing in production builds */}
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
