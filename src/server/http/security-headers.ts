// Imported by next.config.ts, which doesn't resolve the "@/" alias: keep this file free of imports.

const TMDB_IMAGES = "https://image.tmdb.org";
const YOUTUBE_EMBEDS = ["https://www.youtube.com", "https://www.youtube-nocookie.com"];
// The Vercel Toolbar on preview deployments loads from these origins
const VERCEL_TOOLBAR = {
  script: ["https://vercel.live"],
  style: ["https://vercel.live"],
  img: ["https://vercel.live", "https://vercel.com"],
  font: ["https://vercel.live", "https://assets.vercel.com"],
  connect: ["https://vercel.live", "wss://ws-us3.pusher.com"],
  frame: ["https://vercel.live"],
};
const TWO_YEARS_IN_SECONDS = 2 * 365 * 24 * 60 * 60;

export interface SecurityHeaderOptions {
  /** `next dev`: React Refresh needs eval and a WebSocket. */
  isDev: boolean;
  /** Vercel preview deployment, which shows the Vercel Toolbar. */
  isPreview: boolean;
}

/**
 * Content Security Policy for every page. Scripts and styles allow 'unsafe-inline': Next.js
 * inlines its hydration data and Mantine/Motion set inline styles. The alternative, a nonce per
 * request, would force every page to render dynamically and give up static and CDN caching.
 * Everything else is limited to what the app actually loads.
 */
export function buildContentSecurityPolicy({ isDev, isPreview }: SecurityHeaderOptions): string {
  const toolbar = (sources: string[]) => (isPreview ? sources : []);
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      ...(isDev ? ["'unsafe-eval'"] : []),
      ...toolbar(VERCEL_TOOLBAR.script),
    ],
    "style-src": ["'self'", "'unsafe-inline'", ...toolbar(VERCEL_TOOLBAR.style)],
    "img-src": ["'self'", "data:", "blob:", TMDB_IMAGES, ...toolbar(VERCEL_TOOLBAR.img)],
    "font-src": ["'self'", ...toolbar(VERCEL_TOOLBAR.font)],
    "connect-src": ["'self'", ...(isDev ? ["ws:"] : []), ...toolbar(VERCEL_TOOLBAR.connect)],
    "frame-src": [...YOUTUBE_EMBEDS, ...toolbar(VERCEL_TOOLBAR.frame)],
    "worker-src": ["'self'", "blob:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };
  return Object.entries(directives)
    .map(([name, sources]) => `${name} ${sources.join(" ")}`)
    .join("; ");
}

/** Headers for every response; next.config.ts applies them to all routes. */
export function buildSecurityHeaders(options: SecurityHeaderOptions) {
  return [
    { key: "Content-Security-Policy", value: buildContentSecurityPolicy(options) },
    // Browsers ignore it over plain HTTP, so local `next start` is unaffected
    {
      key: "Strict-Transport-Security",
      value: `max-age=${TWO_YEARS_IN_SECONDS}; includeSubDomains`,
    },
    // For browsers without frame-ancestors support
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    // Only features the app never uses; the YouTube player still gets autoplay, fullscreen etc.
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
    },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ];
}
