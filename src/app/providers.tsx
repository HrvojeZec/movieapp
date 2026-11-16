"use client";

import type { ReactNode } from "react";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { AuthProvider } from "@/features/auth/AuthContext";
import { Layout } from "@/shared/components/layout/Layout";
import { AOSProvider } from "@/shared/components/layout/AOSProvider";

// Client-side providers live here so the root layout can stay a Server Component.
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MantineProvider defaultColorScheme="dark">
      <Notifications position="top-right" />
      <AuthProvider>
        <AOSProvider>
          <Layout>{children}</Layout>
        </AOSProvider>
      </AuthProvider>
    </MantineProvider>
  );
}
