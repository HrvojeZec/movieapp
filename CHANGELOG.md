# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Opening a movie from a card makes its poster fly into the movie page (React `<ViewTransition>`;
  only the clicked card takes part, so a movie shown in two rows still animates). Going back is a
  plain navigation, and browsers without view transitions simply skip the animation
- A faint film grain over the home page hero, still with reduced motion and paused off screen
- Action buttons celebrate what they add: the watchlist bookmark drops in and swings, the
  watched eye blinks and gets a check, the heart pops on a spring (removing stays quiet). Play
  trailer, Subscribe and New list lean towards the pointer. Prices roll to the new amount when
  switching between Monthly and Yearly, and the trial badge shines once
- Phones get a full-screen menu instead of the drawer: it slides in from the left over the
  blurred page, rows come in one after another, the profile (or a sign-in card) sits on top, and
  a swipe to the left, the X or Escape closes it. Plan-locked links show the plan they need
- The bell swings and its count pops when a new notification arrives; the sidebar's favorites
  count pops when it grows
- Search suggestions (header, phone menu and Ctrl+K) mark the typed text in each title
- A sidebar for navigation and the library: Browse (Home, Most Watched, Search, Pricing),
  Library (Favorites with their count, Watchlist, Watched, Lists) and For you (Recommendations,
  Stats), with the account at the bottom. Features the plan doesn't include show a lock and the
  plan they need. On desktop it is wide or a narrow rail (button or Ctrl+B), remembered and applied
  before the first paint; on tablets the rail opens over the page. Visitors get a sign-in card.
  A "Skip to content" link comes first for keyboard users
- Stats widgets: an activity calendar (a year of days, brighter for busier days), a genre mix
  ring (top 5 genres and Other, colors validated for color-blind readers), a trend line of movie
  pages opened, a streak ring of active days in a row and the latest watched movies as posters.
  "Watched per month" switches between 6 and 12 months, and a larger "Movies watched" tile adds a
  trend line. Bars, columns, lines and rings grow in as they come into view (static with reduced
  motion); every chart has an empty state, hover details and a table for screen readers
- The Pro stats page is a customizable dashboard: drag widgets by their header, resize them by
  the corner, remove them and add them back from a palette, or reset to the default board. It
  works by keyboard too (Enter picks a widget up, arrows move it, Shift + arrows resize it) with
  screen reader announcements; narrow screens move widgets with up and down buttons. The layout
  saves itself shortly after each change and follows the user across devices
  (`GET`/`PUT /api/user/dashboard`); the stats API also returns daily activity, streaks and the
  latest watched movies for the upcoming widgets
- A 14-day free trial for a first subscription on either paid plan and billing period: Checkout
  still takes the card and charges when the trial ends. It isn't offered again after a trial, or
  to anyone who already subscribed (including subscriptions from before trials existed). The
  pricing page marks the paid plans with "14-day free trial" for visitors and new accounts; the
  existing "Trial started" and "Trial ends soon" notifications, the reminder email and the
  profile's "Trial ends on …" cover the rest. `.env.example` lists the `trial_will_end` webhook
  event
- Stats page on Pro: totals (watched movies, favorites, watchlist, lists), favorite genres as a
  bar list (a movie that is both watched and a favorite counts once) and two monthly charts for
  the last 12 months, movies watched and movie pages opened, each on its own scale. Charts are
  plain CSS bars with a tooltip per bar and a table for screen readers; no chart library. The API
  is private and needs Pro; other plans see the page locked
- Recommendations on Pro: a "Recommended for you" row on the home page and a page with up to 20
  picks, each saying why ("Because you liked Fight Club", "Because you like Drama"). Candidates
  come from TMDB's recommendations for the latest favorites and watched movies and from top-rated
  movies in the user's strongest genres; they're ranked by how many of those suggest them, how
  well their genres fit a profile built from favorites, watched movies and the watchlist (recent
  ones count more) and their rating. Movies the user already has are left out. Without any
  history, popular movies are shown with a hint. Other plans see the row locked
- Advanced filters on Most Watched for Premium and Pro: a year range, several genres at once
  (movies must have all of them), minimum and maximum runtime, original language, sorting (most
  popular, top rated, newest, title) and a minimum number of votes. They live in the URL like the
  basic filters, and "Clear filters" clears them too. Results come from a private route that
  needs the plan and is never cached; the basic filters stay free on the public, cached route.
  Free accounts see the panel locked, and advanced filters in a shared link are ignored for them
- Custom lists on Premium and Pro: "Add to list" on the movie page ticks the lists that hold the
  movie and creates a new one with it; the Lists page (user menu and mobile drawer) shows each
  list with its latest posters, and a list's page can rename it, remove movies or delete it. Up to
  50 lists of 500 movies. Another user's list is a 404. After a downgrade, lists stay readable and
  can still be trimmed or deleted, while creating and adding need Premium again
- Movie page visits of logged-in users are recorded as `view` activity with the movie's genres
  (looked up on the server), at most once an hour per movie, for upcoming stats and
  recommendations. Anonymous visits send nothing
- Watched movies on every plan: an eye on movie cards and a "Mark as watched" button on the movie
  page keep a history with dates, shown newest first on the new Watched page (user menu and mobile
  drawer). Marking a movie as watched takes it off the watchlist, and each movie is stored once
  with its genres for later recommendations and stats. The history lives in its own collection, so
  a long one doesn't grow the session
- Watchlist on Premium and Pro: a bookmark on movie cards and an "Add to watchlist" button on the
  movie page save a movie for later, and the new Watchlist page (user menu and mobile drawer)
  shows them newest first. Free accounts see the button and the page locked with a link to
  pricing; the server refuses adding without the plan, but removing always works, so a list kept
  after a downgrade can be trimmed
- The free plan keeps up to 20 favorites, checked in the same atomic update that adds one, so
  parallel requests can't exceed it; Premium and Pro have no limit. Over the limit after a
  downgrade, favorites are kept and can be removed. The favorites page shows "12 / 20 on the free
  plan" with a link to upgrade when full, and the heart explains the limit instead of failing
- Password reset: "Forgot password?" on the login page emails a one-time link that works for 1 hour
  (only a SHA-256 hash of the token is stored); the reset page sets a new password with the same
  rules as sign-up, and the owner gets a "Your password was changed" notification and email. The
  request answers the same, equally fast, whether or not the email has an account. Limited to 3
  requests an hour per address and 10 reset attempts an hour per IP
- Subscription reminders: a daily Vercel Cron job (`GET /api/cron/subscription-reminders`, 07:00
  UTC, protected by `CRON_SECRET`) notifies and emails subscribers 3 days before a renewal (with
  the price), a scheduled end (with what they lose) or the end of a trial. A missed or repeated run
  never sends a reminder twice, and the trial warning shares its key with Stripe's
  `trial_will_end` webhook so it arrives once
- Transactional email through Gmail SMTP (Nodemailer): every new notification is also emailed, and
  new accounts get a welcome notification and email after sign-up. Emails share one layout with
  an HTML and a plain-text version, stay under a daily limit of 400, and never fail the request
  that sent them. Without SMTP settings emails are only logged; E2E tests capture them in the
  database. New `SMTP_USER`, `SMTP_APP_PASSWORD`, `EMAIL_FROM_NAME` and `EMAIL_TRANSPORT`
- Notifications: a bell in the navbar lists the latest notifications with an unread count, opens
  their page and marks them as read (one by one or all at once); it refreshes every minute and on
  focus. Stripe webhooks create them for plan activation, trial start, cancellation, resume, plan
  changes, the end of a subscription, a trial about to end and failed payments, once per event.
  `GET /api/notifications`, `POST /api/notifications/read`; notifications are deleted after 90 days
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

- The header is slimmer: search and notifications only, turning to glass once the page scrolls.
  Phones keep the menu button
- The profile's favorites count rolls its digits into place like an odometer instead of counting
  up; screen readers and text search get the plain number. Shared springs, a magnetic hover and a
  growing bar wrapper are ready for the upcoming dashboard and buttons. The vendored CountUp
  component is gone
- The movie page shows the watchlist, watched and list buttons in their own row under the title
- End-to-end tests run with reduced motion, which stops the login pages' WebGL background from
  slowing the run down
- End-to-end tests run two workers locally and share one database connection per worker
- On phones the favorites menu moves from the header to the navigation drawer, so the header stays
  on one line
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

- Skeletons of genre rows still below the screen no longer shimmer, which kept an idle home
  page busy (about 9% CPU)
- The pricing page listed the watchlist, custom lists, recommendations and statistics as "Coming
  soon" after they shipped, and left out advanced filters and the watched history. Paid plan
  features now come from the same list the server checks access with, so the two can't drift
  apart again
- Captured (E2E) and skipped emails no longer count toward the daily email limit, which they could
  use up for real emails
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

- The account menu and the favorites preview menu in the header; both moved to the sidebar
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
