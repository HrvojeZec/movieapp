import "../styles/globals.scss";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import { getAppUrl } from "@/server/app-url";
import { APP_NAME } from "@/shared/constants";
import { SIDEBAR_INIT_SCRIPT } from "@/widgets/app-shell/lib/sidebar-script";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

const DESCRIPTION =
  "Discover popular, top-rated and upcoming movies, save favorites and subscribe for premium features.";

export const metadata: Metadata = {
  // Share previews need absolute image URLs; this is the deployment's own origin
  metadataBase: new URL(getAppUrl()),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: DESCRIPTION,
  openGraph: { siteName: APP_NAME, type: "website", title: APP_NAME, description: DESCRIPTION },
  twitter: { card: "summary_large_image", title: APP_NAME, description: DESCRIPTION },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
        {/* Before the first paint, so a collapsed sidebar never flashes wide */}
        <script dangerouslySetInnerHTML={{ __html: SIDEBAR_INIT_SCRIPT }} />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
