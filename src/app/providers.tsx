"use client";

import { useState, type ReactNode } from "react";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Layout } from "@/shared/ui/Layout/Layout";
import { AOSProvider } from "@/shared/providers/AOSProvider";
import { createQueryClient } from "@/shared/lib/query-client";
import { theme } from "@/shared/theme/theme";

// Client-side providers live here so the root layout can stay a Server Component.
export function Providers({ children }: { children: ReactNode }) {
  // One client per browser session; useState keeps it stable across re-renders
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <Notifications position="top-right" />
        <AOSProvider>
          <Layout>{children}</Layout>
        </AOSProvider>
      </MantineProvider>
      {/* Renders nothing in production builds */}
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
