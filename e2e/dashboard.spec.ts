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

test("escape during a mouse drag puts the widget back", async ({ page }) => {
  await openAsPro(page);
  await customize(page);
  const widget = page.locator('[data-widget="genreBars"]');
  // In view, so the pointer goes down on the widget and not outside the window
  await widget.scrollIntoViewIfNeeded();
  const before = await widget.boundingBox();
  const board = (await page.locator("[data-widget]").first().locator("..").boundingBox())!;
  const from = await center(page, widget.locator("[data-drag-handle]"));

  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + (2 * (board.width + GAP)) / COLUMNS, from.y, { steps: 6 });
  await page.keyboard.press("Escape");
  await page.mouse.up();

  await expect.poll(() => widget.boundingBox()).toEqual(before);
  await expect(page.getByText("Saving…")).toHaveCount(0);
  expect(find(await savedLayout(page), "genreBars")).toMatchObject({ x: 0, y: 6 });
});

test("a cancelled drag puts the widget back", async ({ page }) => {
  await openAsPro(page);
  await customize(page);
  const widget = page.locator('[data-widget="genreBars"]');
  const handle = widget.locator("[data-drag-handle]");
  await widget.scrollIntoViewIfNeeded();
  const before = await widget.boundingBox();
  const from = await center(page, handle);

  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + 200, from.y + 120, { steps: 6 });
  // The browser takes the pointer away (a system gesture, a lost window)
  await handle.dispatchEvent("pointercancel");
  await page.mouse.up();

  await expect.poll(() => widget.boundingBox()).toEqual(before);
  await expect(page.getByText("Saving…")).toHaveCount(0);
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

test("a chart can be shown as a table and it stays after reload", async ({ page }) => {
  const user = await registerViaApi(page);
  await seedSubscription(user, { plan: "pro", interval: "month", currentPeriodEnd: PERIOD_END });
  // Pulp Fiction: crime and thriller
  await page.request.post("/api/user/watched", { data: { movieId: "680" } });
  await page.goto("/stats");

  const genres = page.locator('[data-widget="genreBars"]');
  await genres.getByRole("button", { name: "Show as table" }).click();
  const table = genres.locator('[data-view="table"]');
  await expect(table.getByRole("rowheader", { name: "Crime" })).toBeVisible();
  await expect(genres.getByRole("button", { name: "Show as table" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByText("Saved", { exact: true }).first()).toBeVisible();
  expect(find(await savedLayout(page), "genreBars")).toMatchObject({ view: "table" });

  await page.reload();
  await expect(
    genres.locator('[data-view="table"]').getByRole("rowheader", { name: "Crime" }),
  ).toBeVisible();

  await genres.getByRole("button", { name: "Show as chart" }).click();
  await expect(genres.locator('[data-view="chart"]')).toBeVisible();
});

test("switching to the table doesn't start a drag", async ({ page }) => {
  await openAsPro(page);
  await customize(page);
  const genres = page.locator('[data-widget="genreBars"]');
  await genres.scrollIntoViewIfNeeded();
  const before = await genres.boundingBox();

  await genres.getByRole("button", { name: "Show as table" }).click();

  await expect(genres.locator('[data-view="table"]')).toBeVisible();
  expect(await genres.boundingBox()).toEqual(before);
  await finish(page);
  expect(find(await savedLayout(page), "genreBars")).toMatchObject({ x: 0, y: 6, view: "table" });
});

/** Pixels of one grid row step and one column step on the current board. */
async function steps(page: Page) {
  const board = (await page.locator("[data-widget]").first().locator("..").boundingBox())!;
  return { column: (board.width + GAP) / COLUMNS, row: 72 + GAP };
}

test("a widget can be dragged by its grip", async ({ page }) => {
  await openAsPro(page);
  await customize(page);
  const grip = page.getByRole("button", { name: "Move Movies watched", exact: true });
  const { column } = await steps(page);
  const from = await center(page, grip);

  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + 3 * column, from.y, { steps: 8 });
  await page.mouse.up();
  await finish(page);

  expect(find(await savedLayout(page), "tileWatched")).toMatchObject({ x: 3, y: 0 });
});

test("a tile dragged past the middle of the calendar lands below it", async ({ page }) => {
  await openAsPro(page);
  await customize(page);
  const handle = page.locator('[data-widget="tileWatched"] [data-drag-handle]');
  const { row } = await steps(page);
  const from = await center(page, handle);

  // The calendar (4 rows) sits under the tiles; 4 rows down is past its middle
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x, from.y + 4 * row, { steps: 10 });
  await page.mouse.up();
  await finish(page);

  expect(find(await savedLayout(page), "tileWatched")).toMatchObject({ x: 0, y: 6 });
});

test("an impossible spot is shown and the widget goes back", async ({ page }) => {
  await openAsPro(page);
  await customize(page);
  const widget = page.locator('[data-widget="tileWatched"]');
  const handle = widget.locator("[data-drag-handle]");
  const { row } = await steps(page);
  const from = await center(page, handle);

  // One row down, the tile would just float back up
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x, from.y + row, { steps: 6 });
  await expect(page.getByText("Can't place here")).toBeVisible();
  await expect(widget.locator("[data-blocked]")).toHaveCount(1);
  await page.mouse.up();

  await expect(page.getByText("Can't move there.")).toBeAttached();
  await expect(page.getByText("Can't place here")).toHaveCount(0);
  await expect(page.getByText("Saving…")).toHaveCount(0);
  expect(find(await savedLayout(page), "tileWatched")).toMatchObject({ x: 0, y: 0 });
});

test("resizing past a widget's limit shows the limit", async ({ page }) => {
  await openAsPro(page);
  await customize(page);
  const widget = page.locator('[data-widget="tileWatched"]');
  const { column } = await steps(page);
  const from = await center(page, page.getByTitle("Resize Movies watched"));

  // Tiles are at most 4 columns wide
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + 4 * column, from.y, { steps: 8 });
  await expect(widget.locator("[data-limit]")).toHaveCount(1);
  await page.mouse.up();
  await finish(page);

  expect(find(await savedLayout(page), "tileWatched")).toMatchObject({ w: 4 });
});
