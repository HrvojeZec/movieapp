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

### Changed

- Require Node 26 LTS and npm >= 11.10 (#8, #9)
- Replace deprecated `next lint` with the ESLint CLI; lint fails on warnings (#9, #11)
- Format the codebase with Prettier (#10)
- Run ESLint during `next build` again (#11)
- PR automation workflow runs on `pull_request` instead of `pull_request_target`, which GitHub
  blocks by default in public repositories

### Fixed

- Registration failed with a 500 error because the wrong model was imported for user activity (#6)
- Genre filter from the URL was ignored on the Most Watched page (#11)
- Subscription success page could confirm the same Stripe session repeatedly (#11)
- Navbar re-fetched favorite movies on unrelated state changes (#11)

### Removed

- Unused `test-db` route file and commented-out webhook code (#11)

### Security

- Upgrade Next.js to 15.5.29 and patch vulnerable dependencies (mongoose, axios, zod, js-cookie,
  jws, form-data, qs and others); production dependencies have no known vulnerabilities
- Override postcss to 8.5.x for Next.js 15, which pins the vulnerable 8.4.31

## [0.1.0] - 2025-08-18

### Added

- Initial version: movie browsing and search (TMDB), registration and login, favorites,
  subscription plans with Stripe

[Unreleased]: https://github.com/HrvojeZec/movieapp/compare/v0.1.0...develop
[0.1.0]: https://github.com/HrvojeZec/movieapp/releases/tag/v0.1.0
