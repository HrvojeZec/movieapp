"use client";

import "./globals.css";
import "../styles/globals.scss";
import "aos/dist/aos.css";
import { Inter } from "next/font/google";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout/Layout";
import { AOSProvider } from "@/components/Layout/AOSProvider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head></head>
      <body className={inter.className}>
        <MantineProvider defaultColorScheme="dark">
          <Notifications position="top-right" />
          <AuthProvider>
            <AOSProvider>
              <Layout>{children}</Layout>
            </AOSProvider>
          </AuthProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
