# Contributing Guide

## Branches

Create a feature branch from `develop`:

- `feature/<short-slug>` for features
- `fix/<short-slug>` for bug fixes
- `chore/<short-slug>` for infrastructure/tooling

Examples:

- `features/jwt-refresh-rotation`
- `fix/booking-409-conflic`
- `chore/docker-healthcheck`

## Commits (Conventional)

Use conventional commit prefixes:

- `feat:...`
- `fix:...`
- `chore:...`
- `docs:...`
- `refactor:...`
- `test:...`

Examples:

- `feat: add refresh token rotation (auth)`
- `fix: prevent double booking (appointments)`
- `chore: add test coverage upload (ci)`

## Pull Requests

- Link the Issue: `Closes #123`
- Fill the PR template
- Keep PRs small & focused
- Require 1 approval & CI green (lint + tests)

## Code Quality

- Run `npm run lint && npm run format:check` before pushing
- Add tests for new logic / bugfixes
- If you change API, update docs/requests

## Environment

- Copy `.env.example` -> `.env` (do not commit `.env`)
- Docker: `docker compose up -d --build` starts app + db
