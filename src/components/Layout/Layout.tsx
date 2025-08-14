"use client";
import { AppShell, Center, Loader } from "@mantine/core";
import { Navbar } from "./Navbar";
import { useAuth } from "@/contexts/AuthContext";
interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { loading } = useAuth();
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#111827",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Center>
          <div style={{ textAlign: "center" }}>
            <Loader size="lg" mb="md" />
            <div style={{ color: "white", fontSize: "14px" }}>Loading...</div>
          </div>
        </Center>
      </div>
    );
  }
  return (
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
};
