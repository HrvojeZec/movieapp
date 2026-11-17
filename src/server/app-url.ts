const LOCAL_URL = "http://localhost:3000";

/**
 * The app's absolute origin without a trailing slash, for links that leave the browser (emails,
 * Stripe redirects, share previews). APP_URL wins; otherwise Vercel's system variables give the
 * stable production domain or, on previews, the branch URL that stays the same across pushes.
 */
export function getAppUrl(): string {
  const { APP_URL, VERCEL_ENV, VERCEL_PROJECT_PRODUCTION_URL, VERCEL_BRANCH_URL, VERCEL_URL } =
    process.env;

  const url =
    APP_URL ||
    (VERCEL_ENV === "production" && VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${VERCEL_PROJECT_PRODUCTION_URL}`
      : null) ||
    (VERCEL_BRANCH_URL || VERCEL_URL ? `https://${VERCEL_BRANCH_URL || VERCEL_URL}` : null) ||
    LOCAL_URL;

  return url.replace(/\/+$/, "");
}
