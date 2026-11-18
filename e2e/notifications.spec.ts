import { expect, test } from "./fixtures";
import { registerViaApi, seedNotifications } from "./helpers";

test("the bell shows the unread count and marks all as read", async ({ page }) => {
  const user = await registerViaApi(page);
  await seedNotifications(user, [
    { title: "Premium is active", body: "Your Premium subscription is active." },
    { title: "Payment failed", body: "We couldn't charge your card." },
  ]);

  await page.goto("/");
  const bell = page.getByRole("button", { name: "Notifications, 2 unread" });
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
  await seedNotifications(user, [
    { title: "Subscription canceled", body: "You keep Premium until …", link: "/profile" },
  ]);

  await page.goto("/");
  await page.getByRole("button", { name: "Notifications, 1 unread" }).click();
  await page.getByRole("menuitem", { name: /Subscription canceled/ }).click();

  await expect(page).toHaveURL("/profile");
  await expect(page.getByRole("button", { name: "Notifications", exact: true })).toBeVisible();
});

test("someone without notifications sees an empty bell", async ({ page }) => {
  await registerViaApi(page);

  await page.goto("/");
  await page.getByRole("button", { name: "Notifications", exact: true }).click();

  await expect(page.getByText("No notifications yet")).toBeVisible();
});
