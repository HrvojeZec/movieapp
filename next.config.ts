import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle (.next/standalone) for a small Docker image
  output: "standalone",
  // Posters come from TMDB's CDN in fixed sizes, so Next.js image optimization adds cost without benefit.
  images: { unoptimized: true },
};

export default nextConfig;
