import { expect, test } from "./fixtures";
import { getLastEmail } from "./emails";
import { registerViaApi, seedNotifications, type TestUser } from "./helpers";

// Every new account also gets a welcome notification, so seeded ones come on top of it
const WELCOME = 1;

// The welcome notification is stored right after the sign-up response, before its email is sent
const waitForWelcome = (user: TestUser) => getLastEmail(user.email);

test("the bell shows the unread count and marks all as read", async ({ page }) => {
  const user = await registerViaApi(page);
  await waitForWelcome(user);
  await seedNotifications(user, [
    { title: "Premium is active", body: "Your Premium subscription is active." },
    { title: "Payment failed", body: "We couldn't charge your card." },
  ]);

  await page.goto("/");
  const bell = page.getByRole("button", { name: `Notifications, ${2 + WELCOME} unread` });
  await expect(bell).toBeVisible();

  await bell.click();
  await expect(page.getByRole("menuitem", { name: /Payment failed/ })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: /Premium is active/ })).toBeVisible();
  await page.getByRole("button", { name: "Mark all as read" }).click();

  await expect(page.getByRole("button", { name: "Notifications", exact: true })).toBeVisible();
  // Stored on the server, not only in the page
  await page.reload();
  await expect(page.getByRole("button", { name: "Notifications", exact: true })).toBeVisible();
});

test("a notification links to its page", async ({ page }) => {
  const user = await registerViaApi(page);
  await waitForWelcome(user);
  await seedNotifications(user, [
    { title: "Subscription canceled", body: "You keep Premium until …", link: "/profile" },
  ]);

  await page.goto("/");
  await page.getByRole("button", { name: `Notifications, ${1 + WELCOME} unread` }).click();
  await page.getByRole("menuitem", { name: /Subscription canceled/ }).click();

  await expect(page).toHaveURL("/profile");
  await expect(
    page.getByRole("button", { name: `Notifications, ${WELCOME} unread` }),
  ).toBeVisible();
});
