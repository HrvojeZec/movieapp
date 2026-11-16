# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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
  helpers, TMDB route error handling, Stripe helpers and formatting; `npm test` runs in CI

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
- Feature-based folder structure: `src/features/{auth,movies,favorites,subscription,profile}` (each with
  its components, views, validation and `server/` code), `src/server` (database, models, activity log) and
  `src/shared` (layout, helpers, types); `src/app` only contains thin routes. No behavior changes

### Fixed

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

### Removed

- Unused `test-db` route file and commented-out webhook code (#11)
- `@stripe/stripe-js` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, no longer needed with hosted Checkout (#21)
- `js-cookie` and the client-side `verifyTokenClient`, which decoded the JWT without verifying it
- `axios`; the client calls the movie API with `fetch`
- Unused `react-i18next` and `@types/bcryptjs`, debug `console.log` calls, unused shared types and
  the unused `API_ENDPOINTS` constant

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

## [0.1.0] - 2025-08-18

### Added

- Initial version: movie browsing and search (TMDB), registration and login, favorites,
  subscription plans with Stripe

[Unreleased]: https://github.com/HrvojeZec/movieapp/compare/v0.1.0...develop
[0.1.0]: https://github.com/HrvojeZec/movieapp/releases/tag/v0.1.0
