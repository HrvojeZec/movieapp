import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy, buildSecurityHeaders } from "@/server/http/security-headers";

const PRODUCTION = { isDev: false, isPreview: false };

/** The CSP as { directive: sources[] }. */
function parse(policy: string): Record<string, string[]> {
  return Object.fromEntries(
    policy.split("; ").map((directive) => {
      const [name, ...sources] = directive.split(" ");
      return [name, sources];
    }),
  );
}

describe("buildContentSecurityPolicy", () => {
  const csp = parse(buildContentSecurityPolicy(PRODUCTION));

  it("only allows what the app loads", () => {
    expect(csp["default-src"]).toEqual(["'self'"]);
    expect(csp["img-src"]).toContain("https://image.tmdb.org");
    expect(csp["frame-src"]).toContain("https://www.youtube.com");
    expect(csp["connect-src"]).toEqual(["'self'"]);
    expect(csp["font-src"]).toEqual(["'self'"]);
  });

  it("blocks framing, plugins and base or form hijacking", () => {
    expect(csp["frame-ancestors"]).toEqual(["'none'"]);
    expect(csp["object-src"]).toEqual(["'none'"]);
    expect(csp["base-uri"]).toEqual(["'self'"]);
    expect(csp["form-action"]).toEqual(["'self'"]);
  });

  it("never allows eval in production", () => {
    expect(csp["script-src"]).not.toContain("'unsafe-eval'");
  });

  it("allows eval and the reload WebSocket only in development", () => {
    const dev = parse(buildContentSecurityPolicy({ isDev: true, isPreview: false }));
    expect(dev["script-src"]).toContain("'unsafe-eval'");
    expect(dev["connect-src"]).toContain("ws:");
  });

  it("allows the Vercel Toolbar only on preview deployments", () => {
    const preview = parse(buildContentSecurityPolicy({ isDev: false, isPreview: true }));
    expect(preview["script-src"]).toContain("https://vercel.live");
    expect(preview["frame-src"]).toContain("https://vercel.live");
    expect(Object.values(csp).flat()).not.toContain("https://vercel.live");
  });
});

describe("buildSecurityHeaders", () => {
  const headers = Object.fromEntries(
    buildSecurityHeaders(PRODUCTION).map(({ key, value }) => [key, value]),
  );

  it.each([
    ["X-Frame-Options", "DENY"],
    ["X-Content-Type-Options", "nosniff"],
    ["Referrer-Policy", "strict-origin-when-cross-origin"],
    ["Cross-Origin-Opener-Policy", "same-origin"],
  ])("sets %s", (key, value) => {
    expect(headers[key]).toBe(value);
  });

  it("enforces HTTPS for two years", () => {
    expect(headers["Strict-Transport-Security"]).toBe("max-age=63072000; includeSubDomains");
  });

  it("turns off features the app doesn't use, but not the ones the YouTube player needs", () => {
    const policy = headers["Permissions-Policy"];
    expect(policy).toContain("camera=()");
    expect(policy).toContain("microphone=()");
    expect(policy).not.toMatch(/autoplay|fullscreen|encrypted-media/);
  });
});
