import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Posters come from TMDB's CDN in fixed sizes, so Next.js image optimization adds cost without benefit.
  images: { unoptimized: true },
};

export default nextConfig;
