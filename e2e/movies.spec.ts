import { expect, test } from "./fixtures";

const FIGHT_CLUB_ID = 550;

test("the home page shows movie posters", async ({ page }) => {
  await page.goto("/");
  // Posters have the movie title as alt text
  await expect(page.locator('img[alt]:not([alt=""])').nth(5)).toBeVisible();
});

test("searching from the navbar finds a movie and opens its page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("combobox", { name: "Search movies" }).fill("fight club");

  await page.getByText("Fight Club", { exact: true }).first().click();

  await expect(page).toHaveURL(`/movie/${FIGHT_CLUB_ID}`);
  await expect(page.getByRole("heading", { name: "Fight Club" })).toBeVisible();
});

test("the search page lists results for a query", async ({ page }) => {
  await page.goto("/search?q=batman");
  await expect(page.getByText(/Batman/).first()).toBeVisible();
});

test("a movie page shows details and plays the trailer", async ({ page }) => {
  await page.goto(`/movie/${FIGHT_CLUB_ID}`);
  await expect(page.getByRole("heading", { name: "Fight Club" })).toBeVisible();
  await expect(page.getByText("Cast")).toBeVisible();

  await page.getByRole("button", { name: "Play trailer" }).click();
  await expect(page.locator('iframe[src*="youtube.com/embed/"]')).toBeVisible();
});

test("movie data is fetched through our API, never directly from TMDB", async ({ page }) => {
  const tmdbApiRequests: string[] = [];
  page.on("request", (request) => {
    // Compare the parsed hostname, not a substring of the whole URL
    if (new URL(request.url()).hostname === "api.themoviedb.org") {
      tmdbApiRequests.push(request.url());
    }
  });

  await page.goto(`/movie/${FIGHT_CLUB_ID}`);
  await expect(page.getByRole("heading", { name: "Fight Club" })).toBeVisible();

  expect(tmdbApiRequests).toEqual([]);
});

test("a failed request shows an error state that can be retried", async ({ page }) => {
  // Trailers are fetched in the browser (the movie itself is rendered on the server)
  let apiDown = true;
  await page.route(`**/api/movies/${FIGHT_CLUB_ID}/videos`, (route) =>
    apiDown
      ? route.fulfill({ status: 502, json: { message: "Movie service unavailable" } })
      : route.fallback(),
  );

  await page.goto(`/movie/${FIGHT_CLUB_ID}`);
  await page.getByRole("button", { name: "Play trailer" }).click();
  // Server errors are retried twice with backoff before the error state appears
  await expect(page.getByText("Failed to load trailer")).toBeVisible({ timeout: 15_000 });

  apiDown = false;
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.locator('iframe[src*="youtube.com/embed/"]')).toBeVisible();
});

test("the movie page is rendered on the server with title and preview metadata", async ({
  request,
}) => {
  // Raw HTML, before any JavaScript runs: what search engines and link previews see
  const html = await (await request.get(`/movie/${FIGHT_CLUB_ID}`)).text();

  expect(html).toContain("<title>Fight Club (1999) | MovieHub</title>");
  expect(html).toContain('<meta property="og:image" content="https://image.tmdb.org/t/p/w500/');
  expect(html).toContain(">Fight Club</h1>");
});

test("an unknown movie responds with 404", async ({ request }) => {
  expect((await request.get("/movie/999999999")).status()).toBe(404);
  expect((await request.get("/movie/not-a-number")).status()).toBe(404);
});

test("the movie API limits how often one client can call it", async ({ request }) => {
  // 60 requests per minute per address protect the shared TMDB quota
  const LIMIT = 60;
  const statuses = [];
  for (let i = 0; i < LIMIT; i++) {
    statuses.push((await request.get("/api/genres")).status());
  }
  expect(statuses.every((status) => status === 200)).toBe(true);

  // Upstash approximates the sliding window from the previous and current minute, so when the
  // requests straddle a minute boundary a few more can get through before the limit applies
  const EXTRA_ATTEMPTS = 10;
  let limited = false;
  for (let i = 0; i < EXTRA_ATTEMPTS && !limited; i++) {
    limited = (await request.get("/api/genres")).status() === 429;
  }
  expect(limited).toBe(true);
});

test("Most Watched filters can be cleared with one click", async ({ page }) => {
  await page.goto("/most-watched?year=2027&genre=12&rating=0.4");
  await page.waitForLoadState("networkidle");

  // Shown next to the filters, and again in the empty state when nothing matches
  await page.getByRole("button", { name: "Clear filters" }).first().click();

  await expect(page).toHaveURL("/most-watched");
  await expect(page.getByRole("button", { name: "Clear filters" })).toHaveCount(0);
  await expect(page.getByPlaceholder("Release Year")).toHaveValue("");
  await expect(page.getByPlaceholder("Min Rating")).toHaveValue("");
  await expect(page.locator('main a[href^="/movie/"]').first()).toBeVisible();
});
