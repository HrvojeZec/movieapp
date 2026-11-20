import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAppUrl } from "@/server/app-url";

const VARIABLES = [
  "APP_URL",
  "VERCEL_ENV",
  "VERCEL_PROJECT_PRODUCTION_URL",
  "VERCEL_BRANCH_URL",
  "VERCEL_URL",
];

describe("getAppUrl", () => {
  beforeEach(() => {
    // Start each test as a plain local run, whatever the machine running the tests has set
    for (const name of VARIABLES) vi.stubEnv(name, undefined);
  });

  it("prefers APP_URL", () => {
    vi.stubEnv("APP_URL", "https://movies.example.com");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "movieapp.vercel.app");
    expect(getAppUrl()).toBe("https://movies.example.com");
  });

  it("uses the production URL in production", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "movieapp.vercel.app");
    vi.stubEnv("VERCEL_URL", "movieapp-abc123.vercel.app");
    expect(getAppUrl()).toBe("https://movieapp.vercel.app");
  });

  it("uses the branch URL on previews", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "movieapp.vercel.app");
    vi.stubEnv("VERCEL_BRANCH_URL", "movieapp-git-develop-user.vercel.app");
    vi.stubEnv("VERCEL_URL", "movieapp-abc123.vercel.app");
    expect(getAppUrl()).toBe("https://movieapp-git-develop-user.vercel.app");
  });

  it("uses the deployment URL when a preview has no branch URL", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_URL", "movieapp-abc123.vercel.app");
    expect(getAppUrl()).toBe("https://movieapp-abc123.vercel.app");
  });

  it("falls back to localhost", () => {
    expect(getAppUrl()).toBe("http://localhost:3000");
  });

  it("treats an empty APP_URL as not set", () => {
    vi.stubEnv("APP_URL", "");
    expect(getAppUrl()).toBe("http://localhost:3000");
  });

  it("strips a trailing slash", () => {
    vi.stubEnv("APP_URL", "https://movies.example.com/");
    expect(getAppUrl()).toBe("https://movies.example.com");
  });
});
