import { expect, test } from "./fixtures";
import { getActivities, registerViaApi } from "./helpers";

const VIEW_ROUTE = "/api/user/activity/view";

test("opening a movie as a logged-in user records a view", async ({ page }) => {
  const user = await registerViaApi(page);

  await page.goto("/movie/550");
  await expect.poll(async () => (await getActivities(user, "view")).length).toBe(1);
  const [view] = await getActivities(user, "view");
  expect(view.movieId).toBe("550");
  // TMDB's terms limit how long its data may be kept; the genres weren't used anyway
  expect(view.metadata?.genreIds).toBeUndefined();

  // Coming back within the hour isn't a new view
  const reported = page.waitForResponse((response) => response.url().endsWith(VIEW_ROUTE));
  await page.reload();
  expect((await reported).status()).toBe(204);
  expect(await getActivities(user, "view")).toHaveLength(1);
});

test("anonymous visits aren't reported or recorded", async ({ page }) => {
  const reports: string[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith(VIEW_ROUTE)) reports.push(request.url());
  });

  await page.goto("/movie/550");
  await expect(page.getByRole("heading", { name: "Fight Club" })).toBeVisible();
  expect(reports).toHaveLength(0);

  const anonymous = await page.request.post(VIEW_ROUTE, { data: { movieId: "550" } });
  expect(anonymous.status()).toBe(204);
});

test("invalid and unknown movies aren't recorded", async ({ page }) => {
  const user = await registerViaApi(page);

  const invalid = await page.request.post(VIEW_ROUTE, { data: { movieId: "abc" } });
  expect(invalid.status()).toBe(400);
  const unknown = await page.request.post(VIEW_ROUTE, { data: { movieId: "999999999" } });
  expect(unknown.status()).toBe(204);

  expect(await getActivities(user, "view")).toHaveLength(0);
});
