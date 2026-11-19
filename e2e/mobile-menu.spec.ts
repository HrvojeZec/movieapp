import { expect, test } from "./fixtures";

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("the menu opens full screen and closes with Escape", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open navigation" }).click();

    const menu = page.getByRole("dialog", { name: "MovieHub" });
    await expect(menu).toBeVisible();
    const box = (await menu.boundingBox())!;
    expect(Math.round(box.width)).toBe(390);
    expect(Math.round(box.height)).toBe(844);

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  });

  test("swiping left closes the menu", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open navigation" }).click();
    const menu = page.getByRole("dialog", { name: "MovieHub" });
    await expect(menu).toBeVisible();

    // A finger dragged across the menu's header, right to left
    const header = (await menu.getByRole("heading", { name: "MovieHub" }).boundingBox())!;
    const y = header.y + header.height / 2;
    await page.mouse.move(300, y);
    await page.mouse.down();
    await page.mouse.move(80, y, { steps: 10 });
    await page.mouse.up();

    await expect(menu).toBeHidden();
  });

  test("links in the menu navigate and close it", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open navigation" }).click();
    const menu = page.getByRole("dialog", { name: "MovieHub" });

    await menu.getByRole("link", { name: "Most Watched" }).click();
    await expect(page).toHaveURL("/most-watched");
    await expect(menu).toBeHidden();
  });
});

test("search suggestions mark the typed text", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder("Search movies...").fill("fight");

  const suggestions = page.getByRole("listbox", { name: "Suggestions" });
  await expect(suggestions.getByRole("option").first()).toBeVisible();
  await expect(suggestions.locator("mark").first()).toHaveText(/^fight$/i);
});
