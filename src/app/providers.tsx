"use client";

import type { ReactNode } from "react";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout/Layout";
import { AOSProvider } from "@/components/Layout/AOSProvider";

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
