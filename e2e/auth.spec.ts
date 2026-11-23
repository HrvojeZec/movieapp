import { expect, test } from "./fixtures";
import { createTestUser, registerViaApi } from "./helpers";

test("a user can register, log out and log back in", async ({ page }) => {
  const user = createTestUser();

  await page.goto("/auth/register");
  await page.getByLabel("Full Name").fill(user.name);
  await page.getByLabel("Email").fill(user.email);
  await page.getByRole("textbox", { name: "Password" }).fill(user.password);
  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(page).toHaveURL("/");
  await page.getByRole("button", { name: "Account menu" }).click();
  await expect(page.getByText(`Signed in as ${user.email}`)).toBeVisible();

  await page.getByRole("menuitem", { name: "Logout" }).click();
  await expect(page.getByRole("button", { name: "Login" })).toBeVisible();

  await page.goto("/auth/login");
  await page.getByLabel("Email").fill(user.email);
  await page.getByRole("textbox", { name: "Password" }).fill(user.password);
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL("/");
  await page.goto("/profile");
  await expect(page.getByText(user.email)).toBeVisible();
});

test("the session cookie is httpOnly and not readable from JavaScript", async ({
  page,
  context,
}) => {
  await registerViaApi(page);

  const token = (await context.cookies()).find((cookie) => cookie.name === "token");
  expect(token).toMatchObject({ httpOnly: true, sameSite: "Lax" });

  await page.goto("/");
  expect(await page.evaluate(() => document.cookie)).not.toContain("token=");
});

test("registration shows field-level validation errors", async ({ page }) => {
  await page.goto("/auth/register");
  await page.getByLabel("Full Name").fill("Test User");
  // Passes the browser's built-in type="email" check but not the server's validation,
  // so the request actually reaches the API and its field errors are rendered
  await page.getByLabel("Email").fill("test@example");
  await page.getByRole("textbox", { name: "Password" }).fill("weak");
  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(page.getByText("Please enter a valid email address")).toBeVisible();
  await expect(page.getByText("Password must be at least 6 characters long")).toBeVisible();
  await expect(page).toHaveURL("/auth/register");
});

test("login with a wrong password is rejected", async ({ page }) => {
  const user = await registerViaApi(page);
  await page.request.post("/api/auth/logout");

  await page.goto("/auth/login");
  await page.getByLabel("Email").fill(user.email);
  await page.getByRole("textbox", { name: "Password" }).fill("WrongPass123");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page.getByText("Invalid credentials").first()).toBeVisible();
  await expect(page).toHaveURL("/auth/login");
});

test("password guessing from many addresses is still limited per account", async ({ page }) => {
  const user = await registerViaApi(page);
  await page.request.post("/api/auth/logout");
  // A new address for every attempt, as a botnet would use, so the per-address limit never trips
  const attemptFrom = (address: string) =>
    page.request.post("/api/auth/login", {
      data: { email: user.email, password: "WrongPass123" },
      headers: { "x-forwarded-for": `${address}-${user.email}` },
    });

  // The account allows 30 attempts an hour, whatever address they come from
  for (let i = 0; i < 30; i++) {
    expect((await attemptFrom(`guess-${i}`)).status()).toBe(401);
  }
  const blocked = await attemptFrom("guess-last");
  expect(blocked.status()).toBe(429);
  expect((await blocked.json()).message).toMatch(/^Too many login attempts for this account./);
});

test("repeated logins to one account are blocked with a retry time", async ({ page }) => {
  const user = await registerViaApi(page);
  await page.request.post("/api/auth/logout");
  const attempt = () =>
    page.request.post("/api/auth/login", { data: { email: user.email, password: "WrongPass123" } });

  // The limit is 5 attempts per 15 minutes for one address and email
  for (let i = 0; i < 5; i++) {
    expect((await attempt()).status()).toBe(401);
  }
  const blocked = await attempt();
  expect(blocked.status()).toBe(429);
  expect(Number(blocked.headers()["retry-after"])).toBeGreaterThan(0);

  // The form explains why instead of failing silently
  await page.goto("/auth/login");
  await page.getByLabel("Email").fill(user.email);
  await page.getByRole("textbox", { name: "Password" }).fill(user.password);
  await page.getByRole("button", { name: "Sign In" }).click();
  // Seconds or minutes: Upstash counts in 15-minute windows, so near a window's end the wait is short
  await expect(
    page.getByText(/Too many login attempts\. Try again in \d+ (seconds?|minutes?)\./).first(),
  ).toBeVisible();
});
