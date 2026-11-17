import { expect, test } from "./fixtures";

const FIGHT_CLUB_ID = 550;

const meta = (html: string, attribute: "property" | "name", key: string) =>
  html.match(new RegExp(`<meta ${attribute}="${key}" content="([^"]*)"`))?.[1];

// The <link> tag with this rel, so a failure prints the tag instead of the whole page
const linkTag = (html: string, rel: string) =>
  html.match(new RegExp(`<link rel="${rel}"[^>]*>`))?.[0];

test("the home page has a favicon and a share preview", async ({ request }) => {
  // Raw HTML: link previews (Slack, LinkedIn, WhatsApp) read it without running JavaScript
  const html = await (await request.get("/")).text();

  expect(linkTag(html, "icon")).toMatch(/href="\/icon\.svg[^"]*"/);
  expect(linkTag(html, "apple-touch-icon")).toMatch(/href="\/apple-icon[^"]*"/);

  expect(meta(html, "property", "og:site_name")).toBe("MovieHub");
  expect(meta(html, "property", "og:title")).toBe("MovieHub");
  expect(meta(html, "property", "og:description")).toContain("Discover");
  expect(meta(html, "property", "og:image")).toMatch(/^https?:\/\/[^/]+\/opengraph-image/);
  expect(meta(html, "name", "twitter:card")).toBe("summary_large_image");
  expect(meta(html, "name", "twitter:image")).toMatch(/^https?:\/\/[^/]+\/twitter-image/);
});

test("the share image and the icons are served as images", async ({ request }) => {
  for (const [path, type] of [
    ["/opengraph-image", "image/png"],
    ["/twitter-image", "image/png"],
    ["/apple-icon", "image/png"],
    ["/icon.svg", "image/svg+xml"],
  ]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    expect(response.headers()["content-type"], path).toBe(type);
  }
});

test("a movie page shares its poster instead of the site image", async ({ request }) => {
  const html = await (await request.get(`/movie/${FIGHT_CLUB_ID}`)).text();

  expect(meta(html, "property", "og:image")).toContain("image.tmdb.org");
  expect(meta(html, "name", "twitter:image")).toContain("image.tmdb.org");
  expect(meta(html, "property", "og:site_name")).toBe("MovieHub");
});

test("the footer credits TMDB with its logo", async ({ page }) => {
  await page.goto("/most-watched");

  // The footer sits inside the app shell's <main>, so it has no contentinfo landmark role
  const footer = page.locator("footer");
  const logo = footer.getByRole("img", { name: /TMDB/ });
  await expect(logo).toBeVisible();
  await expect(footer.getByRole("link", { name: /TMDB/ }).first()).toHaveAttribute(
    "href",
    /^https:\/\/www\.themoviedb\.org/,
  );
});
