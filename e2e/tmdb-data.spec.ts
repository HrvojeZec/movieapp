import { expect, test } from "./fixtures";
import { E2E_CRON_SECRET } from "./cron";
import { getE2EDatabase } from "./db";
import { registerViaApi } from "./helpers";

const DAY_MS = 24 * 60 * 60 * 1000;
const CRON_PATH = "/api/cron/refresh-tmdb-data";
// Not a TMDB genre: shows whether the stored list was replaced
const MADE_UP_GENRE = 999_999;

test("the TMDB data job needs the cron secret", async ({ request }) => {
  expect((await request.get(CRON_PATH)).status()).toBe(401);
});

// TMDB's API terms: data obtained from TMDB may be kept for at most 6 months
test("genres stored longer than 6 months are refreshed, newer ones are left alone", async ({
  page,
  request,
}) => {
  const user = await registerViaApi(page);
  const db = await getE2EDatabase();
  const { _id: userId } = (await db.collection("users").findOne({ email: user.email }))!;
  const recent = new Date();
  await db.collection("watchedmovies").insertMany([
    // Marked watched before the date was kept, 200 days ago
    {
      userId,
      movieId: "550",
      watchedAt: new Date(Date.now() - 200 * DAY_MS),
      genreIds: [MADE_UP_GENRE],
    },
    {
      userId,
      movieId: "680",
      watchedAt: recent,
      genresUpdatedAt: recent,
      genreIds: [MADE_UP_GENRE],
    },
  ]);
  await db.collection("useractivities").insertOne({
    userId,
    action: "view",
    movieId: "550",
    metadata: { genreIds: [18] },
    createdAt: recent,
  });

  const response = await request.get(CRON_PATH, {
    headers: { authorization: `Bearer ${E2E_CRON_SECRET}` },
  });
  expect(response.status()).toBe(200);

  const watched = db.collection("watchedmovies");
  const old = (await watched.findOne({ userId, movieId: "550" }))!;
  expect(old.genreIds).not.toContain(MADE_UP_GENRE);
  expect(old.genreIds.length).toBeGreaterThan(0);
  expect(old.genresUpdatedAt.getTime()).toBeGreaterThan(Date.now() - DAY_MS);
  expect((await watched.findOne({ userId, movieId: "680" }))!.genreIds).toEqual([MADE_UP_GENRE]);

  const view = (await db.collection("useractivities").findOne({ userId, action: "view" }))!;
  expect(view.metadata?.genreIds).toBeUndefined();
});
