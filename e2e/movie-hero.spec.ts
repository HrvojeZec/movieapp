import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./fixtures";

// Inception: a bright, busy backdrop (white sky, pale buildings) behind the text
const BRIGHT_BACKDROP_MOVIE = "/movie/27205";
// WCAG AA for normal text
const MIN_CONTRAST = 4.5;
// Text sits over many pixels; judge it against the brighter part of what is behind it
const BACKGROUND_PERCENTILE = 0.75;

/**
 * The contrast between an element's text color and what is behind it: the text (and icons) are
 * made transparent, the element is captured, and the brighter pixels stand for the background.
 */
async function contrastBehind(page: Page, element: Locator): Promise<number> {
  const textColor = await element.evaluate((node) => getComputedStyle(node).color);
  await element.evaluate((node) => {
    const style = document.createElement("style");
    style.textContent = "[data-measure], [data-measure] * { color: transparent !important; }";
    document.head.append(style);
    node.setAttribute("data-measure", "");
  });
  const png = (await element.screenshot({ animations: "disabled" })).toString("base64");
  await element.evaluate((node) => node.removeAttribute("data-measure"));

  return page.evaluate(
    async ({ png, textColor, percentile }) => {
      const channel = (value: number) => {
        const c = value / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      };
      const luminance = (r: number, g: number, b: number) =>
        0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

      const image = new Image();
      image.src = `data:image/png;base64,${png}`;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d")!;
      context.drawImage(image, 0, 0);
      const { data } = context.getImageData(0, 0, image.width, image.height);
      const values: number[] = [];
      for (let i = 0; i < data.length; i += 4)
        values.push(luminance(data[i], data[i + 1], data[i + 2]));
      values.sort((a, b) => a - b);
      const background = values[Math.floor(values.length * percentile)];

      const [r, g, b] = textColor.match(/\d+(\.\d+)?/g)!.map(Number);
      const text = luminance(r, g, b);
      return (Math.max(text, background) + 0.05) / (Math.min(text, background) + 0.05);
    },
    { png, textColor, percentile: BACKGROUND_PERCENTILE },
  );
}

test("the movie page text stays readable over a bright backdrop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BRIGHT_BACKDROP_MOVIE);
  await expect(page.getByRole("heading", { name: "Inception" }).first()).toBeVisible();
  const hero = page.locator("[data-movie-hero]");

  const parts = {
    overview: hero.getByText(/^Cobb, a skilled thief/),
    year: hero.getByText("2010", { exact: true }),
    runtime: hero.getByText("2h 28m", { exact: true }),
    genre: hero.getByText("Science Fiction", { exact: true }),
    countries: hero.getByText(/United States of America/),
  };
  for (const [name, part] of Object.entries(parts)) {
    expect(await contrastBehind(page, part), name).toBeGreaterThanOrEqual(MIN_CONTRAST);
  }
});
