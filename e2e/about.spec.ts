import { expect, test } from "./fixtures";

test("the footer leads to the about and credits page", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Footer" })
    .getByRole("link", { name: "About & credits" })
    .click();

  await expect(page).toHaveURL("/about");
  await expect(page).toHaveTitle("About & credits | MovieHub");
  await expect(page.getByRole("heading", { name: "About & credits", level: 1 })).toBeVisible();
});

test("the about page credits TMDB with its logo and notice", async ({ page }) => {
  await page.goto("/about");

  const movieData = page.getByRole("region", { name: "Movie data" });
  await expect(
    movieData.getByText(
      "This website uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.",
    ),
  ).toBeVisible();
  await expect(movieData.getByRole("img", { name: /TMDB/ })).toBeVisible();
  await expect(movieData.getByRole("link", { name: /TMDB/ }).first()).toHaveAttribute(
    "href",
    "https://www.themoviedb.org",
  );
  // TMDB's API terms keep cached data to six months
  await expect(movieData).toContainText("6 months");
});

test("the about page says it is a non-commercial demo and credits third-party code", async ({
  page,
}) => {
  await page.goto("/about");

  await expect(page.getByRole("region", { name: "About MovieHub" })).toContainText(
    "non-commercial",
  );
  await expect(page.getByRole("region", { name: "About MovieHub" })).toContainText(
    "Stripe test mode",
  );

  const software = page.getByRole("region", { name: "Open-source software" });
  await expect(software.getByRole("link", { name: "React Bits" })).toHaveAttribute(
    "href",
    "https://reactbits.dev",
  );
  await expect(software.getByRole("link", { name: "third-party notices" })).toHaveAttribute(
    "href",
    /THIRD_PARTY_NOTICES\.md$/,
  );
});
