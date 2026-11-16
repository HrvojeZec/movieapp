import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle (.next/standalone) for the Docker image only; `next start`
  // (local runs, E2E tests) and Vercel don't support or need it
  output: process.env.NEXT_OUTPUT_STANDALONE === "true" ? "standalone" : undefined,
  // Posters come from TMDB's CDN in fixed sizes, so Next.js image optimization adds cost without benefit.
  images: { unoptimized: true },
};

export default nextConfig;
