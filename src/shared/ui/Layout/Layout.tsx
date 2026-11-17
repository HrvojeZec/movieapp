"use client";
import type { ReactNode } from "react";
import { AppShell } from "@mantine/core";
import { Footer } from "@/shared/ui/Footer/Footer";
import { Navbar } from "@/shared/ui/Navbar/Navbar";
import classes from "./Layout.module.scss";

const HEADER_HEIGHT = 76;

// Pages render right away; the session loads in the background and each view handles its own
// loading state, so a slow profile request no longer blocks the whole app.
export const Layout = ({ children }: { children: ReactNode }) => (
  <AppShell
    header={{ height: HEADER_HEIGHT }}
    classNames={{ root: classes.root, main: classes.main, header: classes.header }}
  >
    <AppShell.Header>
      <Navbar />
    </AppShell.Header>
    <AppShell.Main>
      <div className={classes.page}>{children}</div>
      <Footer />
    </AppShell.Main>
  </AppShell>
);
