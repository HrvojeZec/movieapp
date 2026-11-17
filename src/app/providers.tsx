"use client";

import { useState, type ReactNode } from "react";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "@/features/auth/AuthContext";
import { Layout } from "@/shared/components/layout/Layout";
import { AOSProvider } from "@/shared/components/layout/AOSProvider";
import { createQueryClient } from "@/shared/lib/query-client";

// Client-side providers live here so the root layout can stay a Server Component.
export function Providers({ children }: { children: ReactNode }) {
  // One client per browser session; useState keeps it stable across re-renders
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider defaultColorScheme="dark">
        <Notifications position="top-right" />
        <AuthProvider>
          <AOSProvider>
            <Layout>{children}</Layout>
          </AOSProvider>
        </AuthProvider>
      </MantineProvider>
      {/* Renders nothing in production builds */}
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
