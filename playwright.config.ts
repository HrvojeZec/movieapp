import { defineConfig, devices } from "@playwright/test";
import { E2E_CRON_SECRET } from "./e2e/cron";

// Locally the settings come from .env.local (like Next.js); in CI they are provided as env vars.
try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local (e.g. in CI)
}

const PORT = 3200;
const baseURL = `http://localhost:${PORT}`;

// Tests create real users, so they must never run against the development database.
const e2eMongoUri = process.env.E2E_MONGODB_URI;
if (!e2eMongoUri) {
  throw new Error("Set E2E_MONGODB_URI to a separate test database (see .env.example)");
}
if (e2eMongoUri === process.env.MONGODB_URI) {
  throw new Error("E2E_MONGODB_URI must point to a different database than MONGODB_URI");
}

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Two locally: every test signs up a user (bcrypt, several writes), and more parallel workers
  // queue those on the one server and the free database tier until logins time out
  workers: process.env.CI ? 1 : 2,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  globalTeardown: "./e2e/global-teardown.ts",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Production build: tests what actually ships, and avoids slow on-demand compilation in dev mode
    command: `npm run build && npm run start -- --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    // Takes precedence over MONGODB_URI from .env.local
    // Emails go to a collection the tests can read, never to real inboxes
    env: { MONGODB_URI: e2eMongoUri, EMAIL_TRANSPORT: "capture", CRON_SECRET: E2E_CRON_SECRET },
  },
});
