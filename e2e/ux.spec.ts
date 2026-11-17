import type { Locator } from "@playwright/test";
import { expect, test } from "./fixtures";
import { registerViaApi } from "./helpers";

test.describe("search suggestions", () => {
  test("can be chosen with the keyboard", async ({ page }) => {
    await page.goto("/");
    const search = page.getByRole("combobox", { name: "Search movies" });
    await search.fill("fight club");

    const firstOption = page
      .getByRole("listbox", { name: "Suggestions" })
      .getByRole("option")
      .first();
    await expect(firstOption).toBeVisible();

    await search.press("ArrowDown");
    await expect(firstOption).toHaveAttribute("aria-selected", "true");
    await expect(search).toHaveAttribute(
      "aria-activedescendant",
      (await firstOption.getAttribute("id"))!,
    );

    await search.press("Enter");
    await expect(page).toHaveURL(/\/movie\/\d+$/);
  });

  test("close with Escape and when focus leaves the search", async ({ page }) => {
    await page.goto("/");
    const search = page.getByRole("combobox", { name: "Search movies" });
    const list = page.getByRole("listbox", { name: "Suggestions" });

    await search.fill("batman");
    await expect(list).toBeVisible();
    await search.press("Escape");
    await expect(list).toBeHidden();
    await expect(search).toHaveAttribute("aria-expanded", "false");

    await search.fill("batman returns");
    await expect(list).toBeVisible();
    await search.press("Tab");
    await expect(list).toBeHidden();
  });
});

/** Opacity as the user sees it: an element is only as opaque as all of its ancestors. */
const effectiveOpacity = (locator: Locator) =>
  locator.evaluate((element) => {
    let opacity = 1;
    for (let node: Element | null = element; node; node = node.parentElement) {
      opacity *= Number(getComputedStyle(node).opacity);
    }
    return opacity;
  });

test.describe("on a touch screen", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("the favorite heart is visible without hovering", async ({ page }) => {
    await page.goto("/search?q=fight club");
    const heart = page.getByRole("button", { name: "Add to favorites" }).first();
    await expect(heart).toBeVisible();
    // Polls past the cards' fade-in animation
    await expect.poll(() => effectiveOpacity(heart)).toBe(1);
  });
});

test("the profile describes a free account in plain words", async ({ page }) => {
  await registerViaApi(page);
  await page.goto("/profile");

  await expect(page.getByText("Free plan")).toBeVisible();
  await expect(page.getByText("0 favorites")).toBeVisible();
  await expect(page.getByRole("link", { name: "See plans" })).toBeVisible();
  // A free account has no subscription, so it isn't "inactive"
  await expect(page.getByText("Inactive")).toHaveCount(0);
});
