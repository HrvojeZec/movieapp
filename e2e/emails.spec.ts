import { expect, test } from "./fixtures";
import { getLastEmail } from "./emails";
import { registerViaApi } from "./helpers";

test("registering sends a welcome email", async ({ page }) => {
  const user = await registerViaApi(page);

  const email = await getLastEmail(user.email);

  expect(email.subject).toBe("Welcome to MovieHub");
  expect(email.text).toContain(`Hi ${user.name},`);
  expect(email.html).toContain("Start browsing");
  expect(email.html).toMatch(/href="http:\/\/localhost:\d+\/"/);
});

test("a new account is welcomed in the bell too", async ({ page }) => {
  const user = await registerViaApi(page);
  // Sent right after the sign-up response, once the notification is stored
  await getLastEmail(user.email);

  await page.goto("/");
  await page.getByRole("button", { name: "Notifications, 1 unread" }).click();

  await expect(page.getByRole("menuitem", { name: /Welcome to MovieHub/ })).toBeVisible();
});
