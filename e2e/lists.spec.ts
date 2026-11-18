import { expect, test } from "./fixtures";
import { registerViaApi, seedList, seedSubscription } from "./helpers";

const PERIOD_END = new Date("2027-11-18T12:00:00Z");
const premium = {
  plan: "premium" as const,
  interval: "month" as const,
  currentPeriodEnd: PERIOD_END,
};

test("a premium user creates a list and adds a movie", async ({ page }) => {
  const user = await registerViaApi(page);
  await seedSubscription(user, premium);

  await page.goto("/movie/550");
  await page.getByRole("button", { name: "Add to list" }).click();
  await expect(page.getByText("No lists yet")).toBeVisible();
  await page.getByRole("menuitem", { name: "New list" }).click();
  await page.getByRole("textbox", { name: "List name" }).fill("Sunday classics");
  await page.getByRole("button", { name: "Create and add" }).click();
  await expect(page.getByText("Added to Sunday classics")).toBeVisible();

  // The menu ticks the lists that hold the movie
  await page.getByRole("button", { name: "Add to list" }).click();
  await expect(page.getByRole("menuitem", { name: "Sunday classics (added)" })).toBeVisible();

  await page.goto("/lists");
  await expect(page.getByRole("heading", { name: "My Lists (1)" })).toBeVisible();
  await expect(page.getByText("1 movie ·")).toBeVisible();
  await page.getByRole("link", { name: /Sunday classics/ }).click();
  await expect(page.getByRole("heading", { name: "Sunday classics" })).toBeVisible();
  await expect(page.getByText("Fight Club").first()).toBeVisible();
});

test("a premium user renames, trims and deletes a list", async ({ page }) => {
  const user = await registerViaApi(page);
  await seedSubscription(user, premium);
  const listId = await seedList(user, { name: "Sunday classics", movieIds: ["550", "680"] });

  await page.goto(`/lists/${listId}`);
  await page.getByRole("button", { name: "Rename list" }).click();
  await page.getByRole("textbox", { name: "List name" }).fill("Weekend classics");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("heading", { name: "Weekend classics" })).toBeVisible();

  await page.getByRole("button", { name: "Remove Fight Club from this list" }).click();
  await expect(page.getByText("1 movie", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Delete list" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete list" }).click();
  await expect(page).toHaveURL("/lists");
  await expect(page.getByText("No lists yet")).toBeVisible();
});

test("a free user sees lists locked but can open existing ones after a downgrade", async ({
  page,
}) => {
  const user = await registerViaApi(page);

  await page.goto("/lists");
  await expect(page.getByText("Available on the Premium plan")).toBeVisible();
  await page.goto("/movie/550");
  await page.getByRole("button", { name: "Add to list" }).click();
  await expect(page).toHaveURL("/subscription/pricing");

  const created = await page.request.post("/api/lists", { data: { name: "Not allowed" } });
  expect(created.status()).toBe(403);

  // Lists kept from a paid plan stay readable and can be tidied up
  const listId = await seedList(user, { name: "From Premium", movieIds: ["550", "680"] });
  await page.goto("/lists");
  await expect(page.getByText("Your lists are kept on the free plan")).toBeVisible();
  await page.getByRole("link", { name: /From Premium/ }).click();
  await expect(page.getByText("Fight Club").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Rename list" })).toHaveCount(0);

  const added = await page.request.post(`/api/lists/${listId}/movies`, {
    data: { movieId: "13" },
  });
  expect(added.status()).toBe(403);
  await page.getByRole("button", { name: "Remove Fight Club from this list" }).click();
  await expect(page.getByText("1 movie", { exact: true })).toBeVisible();
});

test("another user's list is not found", async ({ page }) => {
  const owner = await registerViaApi(page);
  const listId = await seedList(owner, { name: "Private", movieIds: ["550"] });

  await registerViaApi(page);
  expect((await page.request.get(`/api/lists/${listId}`)).status()).toBe(404);
  expect((await page.request.delete(`/api/lists/${listId}`)).status()).toBe(404);
  expect((await page.request.get("/api/lists/not-a-list")).status()).toBe(404);

  await page.goto(`/lists/${listId}`);
  await expect(page.getByRole("heading", { name: "List not found" })).toBeVisible();
});
