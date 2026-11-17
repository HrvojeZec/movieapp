import type { NextConfig } from "next";
import { buildSecurityHeaders } from "./src/server/http/security-headers";

const securityHeaders = buildSecurityHeaders({
  isDev: process.env.NODE_ENV === "development",
  isPreview: process.env.VERCEL_ENV === "preview",
});

const nextConfig: NextConfig = {
  // Self-contained server bundle (.next/standalone) for the Docker image only; `next start`
  // (local runs, E2E tests) and Vercel don't support or need it
  output: process.env.NEXT_OUTPUT_STANDALONE === "true" ? "standalone" : undefined,
  // Posters come from TMDB's CDN in fixed sizes, so Next.js image optimization adds cost without benefit.
  images: { unoptimized: true },
  // No need to advertise the framework in every response
  poweredByHeader: false,
  // `next dev` must not write generated instruction files into the repository root
  agentRules: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
