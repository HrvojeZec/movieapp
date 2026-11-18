import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { getEmails, getLastEmail } from "./emails";
import { createTestUser, registerViaApi, type TestUser } from "./helpers";

const RESET_SUBJECT = "Reset your MovieHub password";
const NEW_PASSWORD = "NewPass456";

/** Asks for a reset link through the form and returns its path (the link's origin is APP_URL). */
async function requestResetLink(page: Page, user: TestUser): Promise<string> {
  await page.goto("/auth/login");
  await page.getByRole("link", { name: "Forgot password?" }).click();
  await expect(page).toHaveURL("/auth/forgot-password");
  await page.getByLabel("Email").fill(user.email);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByText("Check your inbox")).toBeVisible();

  const email = await getLastEmail(user.email, RESET_SUBJECT);
  const link = new URL(email.text.match(/https?:\/\/\S+\/auth\/reset-password\S+/)![0]);
  return `${link.pathname}${link.search}`;
}

async function chooseNewPassword(page: Page, path: string) {
  await page.goto(path);
  await page.getByRole("textbox", { name: "New password", exact: true }).fill(NEW_PASSWORD);
  await page.getByLabel("Repeat new password").fill(NEW_PASSWORD);
  await page.getByRole("button", { name: "Change password" }).click();
}

test("a user can reset a forgotten password", async ({ page }) => {
  const user = await registerViaApi(page);
  await page.context().clearCookies();

  const resetPath = await requestResetLink(page, user);
  await chooseNewPassword(page, resetPath);
  await expect(page).toHaveURL("/auth/login");

  await page.getByLabel("Email").fill(user.email);
  await page.getByRole("textbox", { name: "Password" }).fill(NEW_PASSWORD);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL("/");

  // The account owner hears about the change, in case it wasn't them
  await getLastEmail(user.email, "Your password was changed");
});

test("a used reset link is rejected", async ({ page }) => {
  const user = await registerViaApi(page);
  await page.context().clearCookies();
  const resetPath = await requestResetLink(page, user);
  await chooseNewPassword(page, resetPath);
  await expect(page).toHaveURL("/auth/login");

  await chooseNewPassword(page, resetPath);

  await expect(page.getByText("This reset link is invalid or has expired")).toBeVisible();
  await expect(page).toHaveURL(resetPath);
});

test("an unknown email gets the same answer and no email", async ({ request }) => {
  const stranger = createTestUser();

  const response = await request.post("/api/auth/forgot-password", {
    data: { email: stranger.email },
  });

  expect(response.status()).toBe(200);
  expect((await response.json()).message).toBe(
    "If an account exists for that email, a reset link is on its way.",
  );
  expect(await getEmails(stranger.email)).toEqual([]);
});
