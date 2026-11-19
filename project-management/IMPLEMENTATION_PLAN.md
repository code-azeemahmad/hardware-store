# Comprehensive Implementation Plan

**Project:** Hardware & Plywood Store Bilingual Website & Admin Dashboard  
**Status:** Phase 0 Complete — Ready for Phase 1  
**Architecture:** Astro SSG + React Islands, FastAPI, PostgreSQL, Nginx, Docker Compose  
**Containers:** `hardware-frontend`, `hardware-backend`, `hardware-postgres`

---

## Phase Overview & Roadmap Alignment

| Phase | Description | Status |
|---|---|---|
| **Phase 0** | **Project Discovery & Architectural Audit** | **COMPLETE (Awaiting Approval)** |
| **Phase 1** | **Project Foundation & Infrastructure Scaffold** | Ready to begin |
| **Phase 2** | **Design System & Component Library** | Queued |
| **Phase 3** | **Public Website Templates & Localization (EN/UR)** | Queued |
| **Phase 4** | **Backend API & Database Persistence** | Queued |
| **Phase 5** | **Private Administrator Dashboard** | Queued |
| **Phase 6** | **Frontend-Backend Integration & Publishing Workflow**| Queued |
| **Phase 7** | **SEO, Accessibility & Performance Hardening** | Queued |
| **Phase 8** | **Testing, Verification & Production Readiness** | Queued |

---

## PHASE 1: Project Foundation Detailed Plan

### Goal
Establish the clean-architecture skeleton for frontend, backend, database, and infrastructure so that:
1. All three Docker containers (`hardware-frontend`, `hardware-backend`, `hardware-postgres`) spin up reliably with health checks.
2. Nginx serves Astro static files and proxies `/api/v1/` to FastAPI and `/media/` to uploaded assets.
3. Backend connects to PostgreSQL and Alembic runs baseline migrations.
4. TypeScript and Python linting, type-checking, and test harnesses are functional.

---

### Phase 1 Exact Folder & File Manifest

The following files and directories will be created during Phase 1:

```text
hardware-store/
├── .env.example
├── .gitignore
├── docker-compose.yml
│
├── nginx/
│   ├── Dockerfile
│   └── nginx.conf
│
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── astro.config.mjs
│   ├── tailwind.config.cjs (or modern CSS setup)
│   ├── Dockerfile
│   ├── public/
│   │   ├── favicon.svg
│   │   └── robots.txt
│   └── src/
│       ├── layouts/
│       │   └── BaseLayout.astro
│       ├── components/
│       │   ├── astro/
│       │   │   ├── AnnouncementBar.astro
│       │   │   ├── Header.astro
│       │   │   └── Footer.astro
│       │   └── react/
│       │       └── MobileNav.tsx
│       ├── i18n/
│       │   ├── ui.ts
│       │   └── utils.ts
│       ├── pages/
│       │   ├── index.astro
│       │   └── ur/
│       │       └── index.astro
│       ├── styles/
│       │   ├── global.css
│       │   └── variables.css
│       └── types/
│           └── index.ts
│
├── backend/
│   ├── requirements.txt
│   ├── pyproject.toml
│   ├── Dockerfile
│   ├── alembic.ini
│   ├── migrations/
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── exceptions.py
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   ├── session.py
│   │   │   └── base.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── category.py
│   │   │   ├── product.py
│   │   │   └── enquiry.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── common.py
│   │   │   ├── user.py
│   │   │   ├── category.py
│   │   │   └── product.py
│   │   ├── repositories/
│   │   │   └── __init__.py
│   │   ├── services/
│   │   │   └── __init__.py
│   │   └── api/
│   │       ├── __init__.py
│   │       └── v1/
│   │           ├── __init__.py
│   │           ├── router.py
│   │           ├── health.py
│   │           ├── auth.py
│   │           ├── categories.py
│   │           └── products.py
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py
│       ├── test_health.py
│       └── test_auth.py
```

---

### Step-by-Step Phase 1 Execution Steps

1. **Step 1: Environment & Base Configurations**
   - Create root `.gitignore` (ignoring `node_modules`, `__pycache__`, `.env`, build artifacts, persistent media volume).
   - Create comprehensive `.env.example` with non-secret defaults and descriptive comments.

2. **Step 2: Backend Scaffold (`backend/`)**
   - Configure `requirements.txt` with pinned versions (`fastapi`, `uvicorn[standard]`, `pydantic>=2.0`, `pydantic-settings`, `sqlalchemy>=2.0`, `alembic`, `psycopg[binary]`, `pwdlib[argon2]`, `python-jose` or `pyjwt`, `python-multipart`).
   - Create `app/core/config.py` using Pydantic Settings.
   - Configure `app/db/session.py` for SQLAlchemy 2.0 async/sync engine and sessionmaker.
   - Configure `alembic.ini` and `migrations/env.py` to target SQLAlchemy metadata.
   - Create health check endpoint `GET /api/v1/health` verifying database connectivity.
   - Create `backend/Dockerfile` using `python:3.12-slim` with a non-root user.

3. **Step 3: Frontend Scaffold (`frontend/`)**
   - Initialize Astro 4.x/5.x with React and TypeScript support.
   - Configure `tsconfig.json` with strict mode enabled.
   - Set up `variables.css` and `global.css` with CSS custom properties matching reference audit:
     - `--color-primary-red: #E21B23`
     - `--color-secondary-black: #111111`
     - `--color-surface-white: #FFFFFF`
     - `--color-surface-muted: #F5F5F5`
     - `--color-text-dark: #333333`
     - Typography tokens for Latin and Urdu fonts.
   - Create initial bilingual baseline layout `BaseLayout.astro` supporting `lang` and `dir="ltr"|"rtl"`.
   - Create minimal stub pages `pages/index.astro` and `pages/ur/index.astro`.
   - Create multi-stage `frontend/Dockerfile`:
     - Stage 1: Build Astro static output using Node 22.
     - Stage 2: Serve static output with Nginx alpine.

4. **Step 4: Nginx & Reverse Proxy Configuration (`nginx/`)**
   - Configure `nginx.conf`:
     - Serve static files from `/usr/share/nginx/html`.
     - Route `/api/` to `http://hardware-backend:8000/api/`.
     - Route `/media/` to `/data/media` with aggressive static caching.
     - Configure security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, CSP baseline).
     - Enable gzip compression for HTML, CSS, JS, JSON, and SVG.

5. **Step 5: Docker Compose Orchestration (`docker-compose.yml`)**
   - Service `hardware-postgres`: PostgreSQL 17 with healthcheck (`pg_isready`), private internal network, persistent data volume.
   - Service `hardware-backend`: Depends on postgres health, runs migrations, serves Uvicorn.
   - Service `hardware-frontend`: Nginx + Astro output, depends on backend, maps host port `${FRONTEND_PORT:-80}:80`.
   - Named volumes: `postgres_data`, `media_data`.

6. **Step 6: Phase 1 Verification**
   - Run unit test `pytest backend/tests/test_health.py`.
   - Run frontend type check `npm run check`.
   - Verify `docker compose up --build` launches cleanly and all health checks turn healthy.
   - Verify curl `http://localhost/api/v1/health` returns `{"status":"ok","database":"connected"}`.
   - Verify curl `http://localhost/` returns valid HTML with announcement bars and header.

---

## Subsequent Phases (2 through 8) Summary

- **Phase 2 — Design System & UI Components:** Implement sticky dual announcement bars, mega-menu, mobile navigation drawer, hero slider, 4-column product card, collection cards, Google reviews carousel, and dark footer.
- **Phase 3 — Public Website Templates:** Build out Homepage, Category page, Subcategory page, Product detail page with WhatsApp enquiry CTA, Contact page with dual-location maps, About Us, Brands, and Urdu mirrored routes under `/ur/`.
- **Phase 4 — Backend API & Persistence:** Complete SQLAlchemy models (`Category`, `Product`, `Brand`, `ProductImage`, `Attribute`, `Enquiry`, `AdminUser`), Alembic migrations, public CRUD/list endpoints, and rate-limited enquiry submission endpoints.
- **Phase 5 — Admin Dashboard:** Build private admin UI (React SPA/island or SSR route), secure authentication with Argon2id password hashing, single-use invitation tokens, media upload to `/data/media`, product/category CRUD, and enquiry viewer.
- **Phase 6 — Publishing & Integration:** Wire Astro build process to backend API; implement admin "Publish & Rebuild" trigger; verify end-to-end publishing lifecycle.
- **Phase 7 — SEO & Performance:** Implement JSON-LD (`Organization`, `LocalBusiness`, `Product`, `BreadcrumbList`), OpenGraph tags, XML sitemap generation, robots.txt, image optimization (WebP/AVIF), and RTL typography tuning.
- **Phase 8 — Quality Assurance & Launch Readiness:** Run full test suite (backend unit/integration tests, frontend component tests, accessibility audits, visual regression against reference PDFs), document backup/restore runbook, and finalize production deployment guide.
