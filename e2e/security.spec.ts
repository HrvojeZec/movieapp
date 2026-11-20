import { expect, test } from "./fixtures";

const FIGHT_CLUB_ID = 550;

test("pages are served with security headers", async ({ request }) => {
  const response = await request.get("/");
  const headers = response.headers();

  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["content-security-policy"]).not.toContain("'unsafe-eval'");
  expect(headers["strict-transport-security"]).toContain("max-age=");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["permissions-policy"]).toContain("camera=()");
  expect(headers["x-powered-by"]).toBeUndefined();
});

test("the content security policy doesn't block anything the app uses", async ({ page }) => {
  // Collected in the top window only: the YouTube player's own frame isn't ours to police
  await page.addInitScript(() => {
    if (window.top !== window) return;
    const violations: string[] = [];
    Object.assign(window, { cspViolations: violations });
    document.addEventListener("securitypolicyviolation", (event) => {
      violations.push(`${event.violatedDirective} blocked ${event.blockedURI}`);
    });
  });
  const getViolations = () =>
    page.evaluate(() => (window as unknown as { cspViolations: string[] }).cspViolations);

  for (const path of ["/", "/most-watched", "/subscription/pricing", "/auth/login"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    expect(await getViolations(), path).toEqual([]);
  }

  // The movie page, with posters from TMDB and the YouTube trailer
  await page.goto(`/movie/${FIGHT_CLUB_ID}`);
  await page.getByRole("button", { name: "Play trailer" }).click();
  await expect(page.locator('iframe[src*="youtube.com/embed/"]')).toBeVisible();
  await page.waitForLoadState("networkidle");
  expect(await getViolations()).toEqual([]);
});

test("the health check reports the app and its database", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(await response.json()).toEqual({ status: "ok", checks: { database: "ok" } });
});
