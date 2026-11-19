"use client";
import { Suspense, type ReactNode } from "react";
import { AppShell } from "@mantine/core";
import { CommandPalette } from "@/features/search-movies/ui/CommandPalette/CommandPalette";
import { Footer } from "@/widgets/app-shell/ui/Footer/Footer";
import { NavigationProgress } from "@/shared/ui/NavigationProgress/NavigationProgress";
import { Navbar } from "@/widgets/app-shell/ui/Navbar/Navbar";
import { Sidebar } from "@/widgets/app-shell/ui/Sidebar/Sidebar";
import classes from "./Layout.module.scss";

const HEADER_HEIGHT = 64;
export const MAIN_CONTENT_ID = "main";

// Pages render right away; the session loads in the background and each view handles its own
// loading state, so a slow profile request no longer blocks the whole app.
export const Layout = ({ children }: { children: ReactNode }) => (
  <AppShell
    // The header runs the full width and the sidebar starts under it, so the logo and the
    // sidebar toggle stay in one place whether the sidebar is wide or narrow
    layout="default"
    header={{ height: HEADER_HEIGHT }}
    // The width is a CSS variable, so the saved wide/rail choice applies before React loads
    navbar={{ width: "var(--sidebar-width)", breakpoint: "sm", collapsed: { mobile: true } }}
    classNames={{
      root: classes.root,
      main: classes.main,
      header: classes.header,
      navbar: classes.navbar,
    }}
  >
    <a href={`#${MAIN_CONTENT_ID}`} className={classes.skipLink}>
      Skip to content
    </a>
    <AppShell.Header>
      <Navbar />
    </AppShell.Header>
    <AppShell.Navbar aria-label="Main">
      <Sidebar />
    </AppShell.Navbar>
    <AppShell.Main id={MAIN_CONTENT_ID} tabIndex={-1}>
      <div className={classes.page}>{children}</div>
      <Footer />
    </AppShell.Main>
    <CommandPalette />
    {/* useSearchParams needs a Suspense boundary, or static pages bail out of prerendering */}
    <Suspense fallback={null}>
      <NavigationProgress />
    </Suspense>
  </AppShell>
);
