import { test as base, expect } from "@playwright/test";

/**
 * Every test gets its own client address. The API rate-limits per IP, and all tests run from
 * localhost, so without this, parallel tests would share one quota and block each other.
 * (`next start` passes the header through; on Vercel the platform sets it and clients can't.)
 */
export const test = base.extend({
  // The callback is usually called "use"; renamed so the React hooks lint rule doesn't mistake it
  extraHTTPHeaders: async ({ extraHTTPHeaders }, provide, testInfo) => {
    await provide({
      ...extraHTTPHeaders,
      "x-forwarded-for": `e2e-${testInfo.testId}-${testInfo.retry}`,
    });
  },
});

export { expect };
