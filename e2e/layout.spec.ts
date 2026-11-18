import type { Locator } from "@playwright/test";
import { expect, test } from "./fixtures";
import { registerViaApi } from "./helpers";

/** Describes the first ancestor that clips its overflow and cuts off part of the element. */
function findClipping(locator: Locator): Promise<string | null> {
  return locator.evaluate((element) => {
    const box = element.getBoundingClientRect();
    for (let parent = element.parentElement; parent; parent = parent.parentElement) {
      const style = getComputedStyle(parent);
      if (style.overflowX === "visible" && style.overflowY === "visible") continue;
      const bounds = parent.getBoundingClientRect();
      const cut = {
        top: bounds.top - box.top,
        left: bounds.left - box.left,
        bottom: box.bottom - bounds.bottom,
        right: box.right - bounds.right,
      };
      if (Object.values(cut).some((px) => px > 0)) {
        return `${parent.tagName}.${parent.className} (${style.overflowX}/${style.overflowY}) cuts ${JSON.stringify(cut)}`;
      }
    }
    return null;
  });
}

test("movie rows scroll sideways only, and a hovered card isn't cut off", async ({ page }) => {
  await page.goto("/");
  const row = page
    .locator(".mantine-ScrollArea-root")
    .filter({ has: page.locator('a[href^="/movie/"]') })
    .first();
  const card = row.locator('a[href^="/movie/"]').first();
  await expect(card).toBeVisible();

  await expect(
    row.locator('.mantine-ScrollArea-scrollbar[data-orientation="vertical"]'),
  ).toHaveCount(0);

  await card.hover();
  // The card lifts with a 0.3s transition; wait until it has settled
  await expect
    .poll(async () => {
      const before = (await card.boundingBox())?.y;
      await page.waitForTimeout(100);
      return before === (await card.boundingBox())?.y;
    })
    .toBe(true);
  expect(await findClipping(card)).toBeNull();
});

test("the favorites count badge in the navbar is a whole circle", async ({ page }) => {
  await registerViaApi(page);
  const response = await page.request.post("/api/user/favorites", { data: { movieId: "550" } });
  expect(response.ok(), await response.text()).toBeTruthy();

  await page.goto("/");
  // The badge next to the favorites button (the bell has its own)
  const badge = page
    .locator("header .mantine-Indicator-root")
    .filter({ has: page.getByRole("button", { name: "Favorites", exact: true }) })
    .locator(".mantine-Indicator-indicator");
  await expect(badge).toHaveText("1");

  const box = (await badge.boundingBox())!;
  expect(Math.abs(box.width - box.height)).toBeLessThan(1);
  // It used to sit inside the button, whose rounded corners clip their overflow
  const clippingParent = await badge.evaluate((element) => {
    for (let parent = element.parentElement; parent; parent = parent.parentElement) {
      if (parent.tagName === "HEADER") return null;
      if (getComputedStyle(parent).overflow !== "visible") return parent.tagName;
    }
    return null;
  });
  expect(clippingParent).toBeNull();
});
