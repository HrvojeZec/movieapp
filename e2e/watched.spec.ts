import { expect, test } from "./fixtures";
import { registerViaApi, seedWatchlist } from "./helpers";

test("any user can mark a movie as watched and see it in their history", async ({ page }) => {
  await registerViaApi(page);

  await page.goto("/movie/550");
  await page.getByRole("button", { name: "Mark as watched" }).click();
  await expect(page.getByRole("button", { name: "Watched", exact: true })).toBeVisible();

  await page.goto("/watched");
  await expect(page.getByRole("heading", { name: "Watched (1)" })).toBeVisible();
  await expect(page.getByText("Fight Club").first()).toBeVisible();
  await expect(page.getByText(/^Watched \w+ \d{1,2}, \d{4}$/)).toBeVisible();
});

test("unmarking removes it", async ({ page }) => {
  await registerViaApi(page);
  expect(
    (await page.request.post("/api/user/watched", { data: { movieId: "550" } })).status(),
  ).toBe(204);

  await page.goto("/watched");
  await page.getByRole("button", { name: "Mark as not watched" }).click();

  await expect(page.getByText("You haven't marked any movies as watched yet")).toBeVisible();
  const { ids } = await (await page.request.get("/api/user/watched/ids")).json();
  expect(ids).toEqual([]);
});

test("marking a movie as watched takes it off the watchlist", async ({ page }) => {
  const user = await registerViaApi(page);
  await seedWatchlist(user, ["550", "680"]);

  await page.request.post("/api/user/watched", { data: { movieId: "550" } });

  const { user: profile } = await (await page.request.get("/api/user/profile")).json();
  expect(profile.watchlist).toEqual(["680"]);
});

test("marking twice keeps one entry", async ({ page }) => {
  await registerViaApi(page);

  const responses = await Promise.all(
    [1, 2].map(() => page.request.post("/api/user/watched", { data: { movieId: "550" } })),
  );

  expect(responses.map((response) => response.status())).toEqual([204, 204]);
  const history = await (await page.request.get("/api/user/watched")).json();
  expect(history.total).toBe(1);
});

test("rejects unknown movies and logged-out visitors", async ({ page }) => {
  const anonymous = await page.request.post("/api/user/watched", { data: { movieId: "550" } });
  expect(anonymous.status()).toBe(401);
  await page.goto("/watched");
  await expect(page).toHaveURL("/auth/login");

  await registerViaApi(page);
  const unknown = await page.request.post("/api/user/watched", {
    data: { movieId: "999999999" },
  });
  expect(unknown.status()).toBe(404);
});
