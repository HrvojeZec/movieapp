"use client";
import { AppShell } from "@mantine/core";
import { Navbar } from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
}

// Pages render right away; the session loads in the background and each view handles its own
// loading state, so a slow profile request no longer blocks the whole app.
export const Layout = ({ children }: LayoutProps) => (
  <AppShell
    header={{ height: 76 }}
    styles={{
      root: { backgroundColor: "transparent" },
      main: { backgroundColor: "transparent" },
    }}
  >
    <AppShell.Header bg="transparent">
      <Navbar />
    </AppShell.Header>
    <AppShell.Main>{children}</AppShell.Main>
  </AppShell>
);
