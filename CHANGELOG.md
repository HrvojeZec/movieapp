# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Cancel and resume a subscription from the profile: a confirmation lists what the plan loses and
  until when it stays; cancellation takes effect at the end of the paid period. "Manage billing"
  and "Update payment method" open the Stripe Customer Portal (card, invoices, plan changes), and
  subscribers switch plans on the pricing page through it. `POST /api/subscription/cancel`,
  `/resume` and `/portal`, limited to 10 requests a minute per user
- Yearly billing: the pricing page switches between monthly and yearly prices ($99.90 and $199.90
  a year, two months free), checkout takes the interval, and webhooks map yearly prices back to
  their plan. New `STRIPE_PREMIUM_YEARLY_PRICE_ID` and `STRIPE_PRO_YEARLY_PRICE_ID`
- The profile shows the subscription's billing interval, price and what comes next (renewal date,
  the end date of a canceled plan, or the end of a trial), and warns when a payment failed. The
  user stores the Stripe subscription ID, price, interval, period end, cancellation and trial dates
- Plan entitlements in one place (`PLAN_FEATURES`): Premium unlocks the watchlist, custom lists and
  advanced filters, Pro adds recommendations and statistics, Basic keeps up to 20 favorites. The
  server checks them with `requireFeature` (403 naming the plan), and `LockedFeature` shows an
  upgrade prompt in place of a locked feature
- Favicon, home screen icon and a generated share image: links to the app show a MovieHub preview
  in Slack, LinkedIn, WhatsApp and X, and movie pages show their poster
- TMDB logo in the footer next to the attribution
- `getAppUrl()` resolves the app's absolute URL per environment (`APP_URL`, the Vercel production
  domain, the preview branch URL, or localhost)
- `.env.example` documenting all required environment variables (#7)
- Project npm config: `min-release-age=7`, `engine-strict`, approved install scripts (#8)
- Prettier, EditorConfig, `.gitattributes`, Husky hooks with lint-staged and commitlint (#9)
- GitHub Actions CI (lint, format check, typecheck, build, dependency audit), PR title validation,
  automatic labels and assignee, Dependabot configuration (#12)
- Pull request template, MIT license, security policy and this changelog (#18)
- `POST /api/auth/logout`, which clears the auth cookie on the server
- Movie API routes (`/api/movies`, `/api/movies/search`, `/api/movies/discover`, `/api/movies/[id]`,
  `/api/movies/[id]/videos`, `/api/genres`) that call TMDB on the server with validated parameters
  and cache responses for an hour
- `POST /api/user/favorites` and `DELETE /api/user/favorites/[movieId]` replace the endpoint that
  overwrote the whole favorites array
- Placeholder image for movies without a poster
- Field-level validation errors on the login and registration forms
- Page title and description metadata
- CI job that builds the Docker image, and Dependabot updates for the Docker base image
- Per-page titles (e.g. "Pricing | MovieHub")
- ESLint rule that forbids importing server-only modules from client code
- Unit tests with Vitest (122 tests): plan/price mapping, JWT tokens, validation schemas, movie API
  helpers, TMDB route error handling, Stripe helpers and formatting; `npm test` runs in CI (#36)
- End-to-end tests with Playwright (14 tests) against a production build: registration/login/logout,
  httpOnly session cookie, field errors, search, movie details and trailer, favorites, redirect to
  Stripe Checkout; they use a separate `E2E_MONGODB_URI` database and clean up their users. The CI job
  runs once the E2E secrets are configured
- Accessible names for icon-only buttons (favorite heart, account menu) and the search field
- TanStack Query for all server state: cached and deduplicated requests, loading skeletons, error
  states with a "Try again" button, retries for server errors only, and devtools in development
- Infinite scroll on Most Watched with `useInfiniteQuery`; genre rows on the home page load when
  they scroll into view
- Debounced search suggestions (400 ms) that keep the previous results visible while typing
- Unit tests for the HTTP helpers, retry rule, query keys and auth helpers, and an end-to-end test for
  retrying a failed request
- Arrow-key navigation in the search page suggestions, like in the navbar
- Accessible names for the mobile search, favorites menu, trailer close and back buttons
- Server rendering for the movie page and the home page: data is fetched on the server and
  hydrated into TanStack Query, so the content is in the HTML (no loading skeletons on first load,
  visible to search engines)
- Movie page metadata: the title with the release year, the overview as description, and the poster
  as the Open Graph and Twitter preview image
- Unknown or malformed movie IDs respond with HTTP 404
- End-to-end tests for the server-rendered HTML, the metadata and the 404
- Responsive header: on phones a burger opens a drawer with search, navigation and login, so the
  header fits on one line; a Pricing link next to Most Watched
- Footer with the TMDB attribution required by its terms of use
- 404 pages (a general one and a movie-specific one), an error page with "Try again", and a loading
  state for the home page
- End-to-end tests for the mobile drawer, the footer attribution and the 404 pages
- Animations with Motion: movie cards and panels fade in as they scroll into view, in short
  staggered waves; a page transition, a pop on the trailer modal and a shimmer on loading skeletons.
  Above-the-fold content (hero, page transition) animates with CSS, so it never waits for JavaScript,
  and everything respects the reduced-motion setting
- React Bits effects: a blurred hero edge (GradualBlur), a tilting poster on the movie page
  (TiltedCard), sparks when adding a favorite (ClickSpark), a glare over posters (GlareHover),
  spotlight pricing cards with a star border on the recommended plan and a shiny badge, blur-in
  subtitles (BlurText), counting numbers on the profile (CountUp) and an animated background on the
  login and registration pages (DarkVeil, loaded only there). Third-party license in
  `THIRD_PARTY_NOTICES.md`
- Search suggestions follow the ARIA combobox pattern: screen readers announce the list and the
  highlighted movie, the highlighted option scrolls into view, and Tab, Escape or clicking elsewhere
  close the list
- Movie cards are real links: they work with the keyboard, show a focus ring and can open in a new tab
- End-to-end tests for keyboard search, the favorite button on touch screens and the profile wording
- Recently viewed: the last 12 opened movies appear in a row on the home page, saved in this
  browser (Zustand with localStorage, loaded after mounting so the server-rendered HTML still matches)
- Command palette: Ctrl+K / ⌘K searches movies from anywhere with the keyboard and lists recently
  viewed movies before anything is typed; on phones the search icon opens it full screen; the navbar
  search box shows the shortcut
- Unit tests for the recently viewed list and store, end-to-end tests for both features
- Rate limiting with a sliding window: login 5 per 15 minutes per IP and email, registration 5 per
  hour per IP, movie API 60 per minute per IP (protects the shared TMDB quota), checkout 10 per
  minute per user. Blocked requests get a 429 with `Retry-After` and a message the forms show.
  Counts live in Upstash Redis (free plan) when `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`
  (or the Vercel Marketplace `KV_REST_API_*` variables) are set, and in memory otherwise; if Redis
  fails, requests go through rather than locking everyone out
- Unit tests for the limiters, the 429 response and client IP detection; end-to-end tests for the
  login and movie API limits. Each end-to-end test uses its own client address, so tests running in
  parallel don't share a quota
- A thin progress bar at the top of the page while a navigation takes longer than 150 ms, so a slow
  server render doesn't look like the app froze
- A "Clear filters" button on Most Watched, next to the filters and in the empty state
- `GET /api/health` reports whether the app reaches its database (200 or 503, never cached), and
  the Docker image uses it as its `HEALTHCHECK`

### Changed

- Require Node 26 LTS and npm >= 11.10 (#8, #9)
- Replace deprecated `next lint` with the ESLint CLI; lint fails on warnings (#9, #11)
- Format the codebase with Prettier (#10)
- Run ESLint during `next build` again (#11)
- Dependabot updates coupled packages together (`@mantine/*`, Next.js with `eslint-config-next`, React)
  and skips major upgrades of Mantine, Next.js and TypeScript, which are planned separately
- PR automation workflow runs on `pull_request` instead of `pull_request_target`, which GitHub
  blocks by default in public repositories (#19)
- Upgrade the Stripe SDK to v23 (API version `2026-10-28.endive`); the client is created lazily (#21)
- Pricing page shows only features that exist and marks planned ones as coming soon (#21)
- The root layout is a Server Component; client providers moved to `src/app/providers.tsx`
- `MONGODB_URI` and `JWT_SECRET` are read when first used, so the app builds without secrets and CI
  no longer needs placeholder values
- Package renamed from `my-app` to `movieapp` and marked as MIT licensed
- Docker: multi-stage image on Node 26 Alpine using Next.js `standalone` output, running as a non-root
  user; `compose.yaml` runs it locally with secrets from `.env.local` at runtime
- `output: "standalone"` is only enabled for the Docker build, so `next start` keeps working
- Feature-based folder structure: `src/features/{auth,movies,favorites,subscription,profile}` (each with
  its components, views, validation and `server/` code), `src/server` (database, models, activity log) and
  `src/shared` (layout, helpers, types); `src/app` only contains thin routes. No behavior changes
- The session is a query (`useAuth`); login, registration, logout and favorites are mutations.
  Favorites update optimistically and roll back only the movie that failed, so quick toggles of
  several movies stay consistent
- The app no longer blocks every page behind a full-screen loader until the session loads; the
  navbar shows a placeholder and protected views handle their own loading state
- Client fetchers throw an `HttpError` with the API's message instead of returning empty data, so
  failures are visible instead of rendering an empty page
- Features follow one folder layout: `api/` (fetchers and query options), `hooks/` (one hook per
  file), `ui/` (one folder per component), `views/`, `lib/` (pure helpers), `validations/`, `server/`,
  `constants.ts` and `types.ts`; favorites logic moved from auth into the favorites feature and unit
  tests into `__tests__` folders. No behavior changes
- API routes share small helpers (`withRouteHandler`, `parseJson`, `requireSession`, `RouteError`)
  instead of repeating try/catch, validation and 401 handling; every error response has the same
  `{ message, errors? }` shape. Checkout logic moved from the route handlers into the subscription
  feature
- Password and name limits are defined once for the zod schemas and the User model; emails are
  trimmed and lowercased by the schemas; magic numbers in TMDB validation, cache headers and the
  database connection are named constants
- Reusable hooks and components replace duplicated UI code: one search box for the navbar and the
  search page, `FavoriteButton` with `useFavorite`, `useCheckout`, `useDiscoverFilters`,
  `useInfiniteScroll` and `useAuthForm`; the navbar and the pricing and profile pages are split into
  smaller components; magic numbers are named constants and paths come from one `ROUTES` map
- Styles moved from inline objects and global classes into a Mantine theme and CSS modules; Mantine
  styles load in a cascade layer, so the app styles reliably override them
- No more magic values: HTTP statuses (`HTTP_STATUS`), API endpoints (`API_ROUTES`), durations
  (`MINUTE_MS`, `DAY_IN_SECONDS`, ...) and CSS colors and shadows are named in one place; query keys live in
  their own `query-keys.ts` per feature; `postJson`/`deleteJson`, `notifySuccess`/`notifyError` and
  `requireEnv` replace repeated request, notification and environment variable code
- All TMDB requests live in one server module shared by the API routes and the server-rendered
  pages; the home and movie pages render per request (TMDB responses stay cached for an hour), so
  the build still needs no secrets
- The navbar search box and the command palette share one suggestion list component
- Movie cards prefetch their page when hovered, focused or touched instead of whenever they scroll
  into view (previously 10-40 server renders per page of cards)
- The subscription success page shows the new plan as an admission ticket (what it includes and the
  price), with a loading skeleton, the API's reason when confirmation fails, and links to movies
  and the profile
- Upgrade Next.js and `eslint-config-next` to 16.4.6: Turbopack builds and serves the app in
  development and production, `next dev` writes to `.next/dev` so a build no longer breaks a
  running dev server, and ESLint uses the package's native flat config. `next build` no longer
  runs ESLint; CI runs it as a separate step
- Upgrade Mantine to 9.8.0. The app keeps its look: the theme pins the previous default radius
  (`sm`) and the translucent 8.x colors of light and subtle variants (`v8CssVariablesResolver`).
  The password field's show/hide button now has an accessible name
- Upgrade Mongoose to 9.12.1 (MongoDB driver 7.8): the password hashing hook is a plain async
  function, and updates that return the new document use `returnDocument: "after"`

### Fixed

- The pricing page briefly marked Basic as the current plan for subscribers on every load; no
  plan is marked until the session has loaded
- Registration failed with a 500 error because the wrong model was imported for user activity (#6)
- Genre filter from the URL was ignored on the Most Watched page (#11)
- Subscription success page could confirm the same Stripe session repeatedly (#11)
- Navbar re-fetched favorite movies on unrelated state changes (#11)
- Favorites are updated atomically (`$addToSet`/`$pull`), so concurrent changes no longer overwrite
  each other, and movie IDs are validated
- Toggling a favorite dropped the subscription plan from the client state until a reload
- Favorite/unfavorite activity was never logged because the client didn't send the movie ID
- Valid emails with longer TLDs (e.g. `.info`, `.studio`) were rejected at registration
- Activity metadata was silently discarded because the field was missing from the schema
- A failure while logging registration activity no longer fails the registration
- Remaining Croatian validation messages and comments translated to English
- The Docker image could not be built (Node 18, production-only install without TypeScript), and the
  compose file name was not picked up by `docker compose` on case-sensitive systems
- Subscribing did not work: the pricing page used hard-coded Payment Links and called a missing
  `create-checkout-session` route; checkout now starts from a server-created Checkout Session (#21)
- The Pro plan was never activated because its price ID was compared with the webhook secret (#21)
- Webhook errors were swallowed with a 200 response, so Stripe never retried failed deliveries (#21)
- Subscription plan and status were missing from the login response until the page was reloaded
- The subscription success page showed "Subscription Successful!" to logged-out visitors without
  confirming the payment
- Subscribe buttons ignored clicks while the session was still loading
- A malformed JSON body on login or registration returned 500 instead of 400
- The registration response was missing the subscription plan and status that login returns
- Hover effects on the pricing buttons and search suggestions and the search placeholder color never
  applied, because inline styles can't express pseudo-classes
- Favorite hearts clicked before the session loaded sent logged-in users to the login page
- An empty filter in the Most Watched URL (e.g. `?year=`) filtered by year 0 and showed an error
- The profile showed "Inactive" for trialing and past-due subscriptions, which still have access
- The hero labeled TMDB ratings as IMDb; trailer buttons now read "Play trailer" instead of
  "watch now" / "Watch Trailer"
- A click on Sign In before the page was interactive was lost; the button stays disabled until the
  form can handle it
- The favorite button on movie cards only appeared on hover, so touch screens never showed it
- Movie cards had a fixed height that left empty space under short titles; cards now fit their
  content and line up, and loading skeletons match their size
- Unrated movies showed a rating of 0.0; they now say "Not rated"
- The profile called a free account "Inactive", described features that don't exist, used emoji and
  showed "Member since" twice; it now shows the plan, a readable subscription status and a link to
  the plans
- "Coming soon" badges on the pricing cards were cut off
- The Most Watched year filter couldn't show next year's releases; Most Watched and Favorites have a
  real page heading
- Horizontal movie rows showed a vertical scrollbar, and a hovered card could be cut off at the top
- The favorites count badge in the navbar was clipped by the heart button's rounded corners
- End-to-end tests reused the same client addresses on every run, so with Redis they inherited the
  previous run's rate limit counts

### Removed

- Unused `test-db` route file and commented-out webhook code (#11)
- `@stripe/stripe-js` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, no longer needed with hosted Checkout (#21)
- `js-cookie` and the client-side `verifyTokenClient`, which decoded the JWT without verifying it
- `axios`; the client calls the movie API with `fetch`
- Unused `react-i18next` and `@types/bcryptjs`, debug `console.log` calls, unused shared types and
  the unused `API_ENDPOINTS` constant
- `AuthContext` and `react-infinite-scroll-component`
- Unused movie fetchers (`getPopularMovies`, `getTopRatedMovies`, `getNowPlayingMovies`,
  `getUpcomingMovies`, `getMoviesByGenre`), replaced by `getMovieList` and `discoverMovies`
- The `minlength` check on the stored password, which only ever saw the 60-character hash
- Unused global CSS classes and the leftover `globals.css` from the project template
- Unused date formats and dayjs plugins, and exports that nothing outside their module used
- Unused images from the project template in `public/`
- `aos`, replaced by Motion; it hid all content until scrolled into view
- The postcss override for Next.js 15 (Next.js 16 ships a patched postcss) and the unused
  `@eslint/eslintrc` compatibility layer

### Security

- Upgrade Next.js to 15.5.29 and patch vulnerable dependencies (mongoose, axios, zod, js-cookie,
  jws, form-data, qs and others); production dependencies have no known vulnerabilities (#20)
- Override postcss to 8.5.x for Next.js 15, which pins the vulnerable 8.4.31 (#20)
- Override minimatch to 11.x for `@typescript-eslint/typescript-estree` (dev only) until
  `@typescript-eslint` 8.73+ passes `min-release-age`
- Any logged-in user could activate a subscription with another user's paid Checkout Session ID;
  sessions are now bound to the user via `client_reference_id` (#21)
- Price IDs are resolved on the server, so clients cannot choose an arbitrary price (#21)
- The JWT is stored in an `httpOnly`, `sameSite=lax` (and `secure` in production) cookie set by the
  server instead of a cookie written by client-side JavaScript, and is no longer returned in API responses
- The TMDB API key is no longer exposed in the browser bundle: `NEXT_PUBLIC_TMDB_API_KEY` is replaced
  by the server-only `TMDB_API_KEY`
- JWTs are signed and verified with an explicit `HS256` algorithm
- `.dockerignore` keeps `.env*` files and other local files out of the Docker build context
- Content Security Policy limited to what the app loads (TMDB images, YouTube embeds), with
  `frame-ancestors 'none'`, `object-src 'none'` and no `eval` in production
- HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` and
  `Cross-Origin-Opener-Policy` on every response; `X-Powered-By` is no longer sent
- The dependency audit in CI fails on high and critical advisories except ones accepted in
  `scripts/audit.mjs` with a reason and an expiry date; picomatch ReDoS (GHSA-fc5q-39xc-vjpf) is
  accepted until 2026-12-31 because no patched release exists and globs never come from user input

## [0.1.0] - 2025-08-18

### Added

- Initial version: movie browsing and search (TMDB), registration and login, favorites,
  subscription plans with Stripe

[Unreleased]: https://github.com/HrvojeZec/movieapp/compare/v0.1.0...develop
[0.1.0]: https://github.com/HrvojeZec/movieapp/releases/tag/v0.1.0
