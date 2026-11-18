# Changelog

Record meaningful user-visible changes, API/schema changes, security changes, and deployment changes.

Use date headings and concise entries. Link to task IDs and ADRs where applicable.

## 2026-11-18 — Phase 1: Project Foundation Complete

- **Added:**
  - Initialized Astro 5 project with `@astrojs/react` integration, TypeScript strict mode, and CSS variable tokens matching reference audit (`#E21B23`, `#111111`, `#FFFFFF`, `#F5F5F5`).
  - Bilingual layout (`BaseLayout.astro`) with English (`/`) and Urdu RTL (`/ur/`) support, `AnnouncementBar`, `Header`, and `Footer`.
  - React island component `LanguageSwitcher.tsx` for seamless locale toggling.
  - Modular FastAPI application (`app/core`, `app/db`, `app/models`, `app/schemas`, `app/api/v1`).
  - Implemented health check endpoint `GET /api/v1/health` with live PostgreSQL database ping.
  - Implemented secure admin login `POST /api/v1/auth/login` with Argon2id password verification and JWT issuance.
  - Implemented customer enquiry submission endpoint `POST /api/v1/enquiries` with schema validation.
  - Implemented CLI bootstrap utility `python -m app.cli create-admin`.
  - Configured PostgreSQL 17 Alpine and Alembic migration `001_initial_schema`.
  - Configured multi-stage Dockerfiles for frontend (Node 22 build -> Nginx Alpine runtime) and backend (`python:3.12-slim`).
  - Configured root `docker-compose.yml` orchestrating `hardware-frontend`, `hardware-backend`, and `hardware-postgres` on private bridge network `hardware_internal_network` with volume persistence.
  - Configured Nginx as public reverse proxy (`/api/` -> backend, `/media/` -> volume, `/` -> static Astro output) with security headers.
  - Added Pytest automated test suite (6 passing tests).
- **Security:**
  - Enforced server-side Argon2id password hashing and JWT access tokens.
  - Added security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`).
  - Isolated PostgreSQL container from public host network.
- **Related tasks:** P1-01, P1-02, P1-03, P1-04, P1-05, P1-06.

## Entry template

### YYYY-MM-DD
- **Added:** ...
- **Changed:** ...
- **Fixed:** ...
- **Security:** ...
- **Migration:** ...
- **Related tasks/ADRs:** ...
