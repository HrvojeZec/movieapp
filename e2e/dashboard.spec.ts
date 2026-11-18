import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { registerViaApi, seedSubscription } from "./helpers";

const ROUTE = "/api/user/dashboard";
const PERIOD_END = new Date("2027-11-18T12:00:00Z");
const GAP = 16;
const COLUMNS = 12;

interface Item {
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

async function openAsPro(page: Page, plan: "pro" | "premium" = "pro") {
  const user = await registerViaApi(page);
  await seedSubscription(user, { plan, interval: "month", currentPeriodEnd: PERIOD_END });
  await page.goto("/stats");
}

const savedLayout = async (page: Page): Promise<Item[]> =>
  (await (await page.request.get(ROUTE)).json()).layout;

const find = (layout: Item[], type: string) => layout.find((item) => item.type === type);

const readingOrder = (layout: Item[]) =>
  [...layout].sort((a, b) => a.y - b.y || a.x - b.x).map((item) => item.type);

async function customize(page: Page) {
  await page.getByRole("button", { name: "Customize" }).click();
}

async function finish(page: Page) {
  await page.getByRole("button", { name: "Done" }).click();
  // The visible status (a live region repeats it for screen readers)
  await expect(page.getByText("Saved", { exact: true }).first()).toBeVisible();
}

/** Drags from the middle of `from` by a number of grid columns and rows. */
async function dragBy(page: Page, from: { x: number; y: number }, columns: number, rows = 0) {
  const board = (await page.locator("[data-widget]").first().locator("..").boundingBox())!;
  const step = (board.width + GAP) / COLUMNS;
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + columns * step, from.y + rows * (72 + GAP), { steps: 8 });
  await page.mouse.up();
}

const center = async (page: Page, locator: ReturnType<Page["locator"]>) => {
  const box = (await locator.boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
};

test("a pro user rearranges the dashboard and it stays after reload", async ({ page }) => {
  await openAsPro(page);
  await customize(page);

  const header = page
    .locator('[data-widget="tileWatched"]')
    .getByRole("heading", { name: "Movies watched" });
  await dragBy(page, await center(page, header), 3);
  await finish(page);

  expect(find(await savedLayout(page), "tileWatched")).toMatchObject({ x: 3, y: 0 });
  await page.reload();
  await expect(page.getByRole("heading", { name: "Your Stats" })).toBeVisible();
  expect(find(await savedLayout(page), "tileWatched")).toMatchObject({ x: 3, y: 0 });
});

test("the dashboard can be rearranged with the keyboard", async ({ page }) => {
  await openAsPro(page);
  await customize(page);

  await page.getByRole("button", { name: "Move Movies watched", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Picked up. Movies watched, column 1, row 1, 3 by 2")).toBeAttached();
  // One row down would fall straight back up, so the step lands below the activity calendar
  await page.keyboard.press("ArrowDown");
  await expect(page.getByText("Movies watched, column 1, row 7, 3 by 2")).toBeAttached();
  await page.keyboard.press("Shift+ArrowRight");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Dropped. Movies watched, column 1, row 7, 4 by 2")).toBeAttached();
  await finish(page);

  expect(find(await savedLayout(page), "tileWatched")).toMatchObject({ x: 0, y: 6, w: 4 });
});

test("escape puts a picked up widget back", async ({ page }) => {
  await openAsPro(page);
  await customize(page);

  await page.getByRole("button", { name: "Move Favorite genres", exact: true }).focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Escape");
  await expect(
    page.getByText("Cancelled. Favorite genres, column 1, row 7, 6 by 5"),
  ).toBeAttached();
});

test("widgets can be resized, removed and added back from the palette", async ({ page }) => {
  await openAsPro(page);
  await customize(page);

  await dragBy(page, await center(page, page.getByTitle("Resize Movies watched")), 1);
  await finish(page);
  expect(find(await savedLayout(page), "tileWatched")).toMatchObject({ w: 4, h: 2 });

  await customize(page);
  await page.getByRole("button", { name: "Remove Movies watched" }).click();
  await expect(page.locator('[data-widget="tileWatched"]')).toHaveCount(0);
  await finish(page);
  expect(find(await savedLayout(page), "tileWatched")).toBeUndefined();

  await customize(page);
  await page.getByRole("button", { name: "Add widget" }).click();
  const palette = page.getByRole("dialog", { name: "Widgets" });
  await palette.getByRole("button", { name: "Add Movies watched" }).click();
  await expect(palette.getByText("Every widget is on your board.")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator('[data-widget="tileWatched"]')).toBeVisible();
  await finish(page);
  expect(find(await savedLayout(page), "tileWatched")).toMatchObject({ w: 3, h: 2 });
});

test("reset restores the default layout", async ({ page }) => {
  const user = await registerViaApi(page);
  await seedSubscription(user, { plan: "pro", interval: "month", currentPeriodEnd: PERIOD_END });
  await page.request.put(ROUTE, {
    data: { layout: [{ type: "genreBars", x: 0, y: 0, w: 12, h: 6 }] },
  });
  await page.goto("/stats");
  await expect(page.locator("[data-widget]")).toHaveCount(1);

  await customize(page);
  await page.getByRole("button", { name: "Reset layout" }).click();
  await page
    .getByRole("dialog", { name: "Reset the layout?" })
    .getByRole("button", { name: "Reset" })
    .click();
  await expect(page.locator("[data-widget]")).toHaveCount(11);
  await finish(page);

  const layout = await savedLayout(page);
  expect(layout).toHaveLength(11);
  expect(find(layout, "genreBars")).toEqual({ type: "genreBars", x: 0, y: 6, w: 6, h: 5 });
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("on a phone widgets move with up and down buttons", async ({ page }) => {
    await openAsPro(page);
    await customize(page);

    await expect(
      page.getByRole("button", { name: "Move Movies watched", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Move Movies watched up", exact: true }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "Move Favorites up", exact: true }).click();
    await finish(page);

    expect(readingOrder(await savedLayout(page)).slice(0, 2)).toEqual([
      "tileFavorites",
      "tileWatched",
    ]);
  });
});

test("customizing is only for pro", async ({ page }) => {
  await openAsPro(page, "premium");

  await expect(page.getByText("Available on the Pro plan")).toBeVisible();
  await expect(page.getByRole("button", { name: "Customize" })).toHaveCount(0);
});
