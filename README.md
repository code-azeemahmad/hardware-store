# Naseer Plywood & Hardware

A bilingual (English and Urdu) product-catalogue website and private administration platform for an architectural hardware and plywood retailer in Sargodha, Pakistan.

![Naseer Plywood & Hardware Storefront](docs/03-design/screenshots/implemented-homepage-desktop-en.png)

## Overview

Wholesale and retail hardware distribution in Pakistan operates on custom quotations, project-scale estimations, and fluctuating sheet-material prices rather than automated card checkouts. This platform serves as a high-performance digital catalogue and direct-inquiry funnel for builders, carpenters, contractors, and homeowners.

Visitors can browse physical showroom inventory, filter items across multi-tier architectural categories, inspect high-resolution product photography, and initiate direct conversations with sales staff via WhatsApp, telephone, or web enquiry forms. Store managers use a private, authenticated control panel to manage catalog data, process leads, onboard team members, and trigger static site rebuilds with zero visitor downtime.

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment variables](#environment-variables)
  - [Running in development](#running-in-development)
  - [Running tests](#running-tests)
  - [Building for production](#building-for-production)
- [Project structure](#project-structure)
- [Scripts and commands](#scripts-and-commands)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact and showroom](#contact-and-showroom)

## Features

- **Bilingual localization (English and Urdu):** Full English (LTR at `/`) and Urdu (RTL at `/ur/`) routing with Noto Nastaliq Urdu typography, mirrored interfaces, and reciprocal `hreflang` tags.
- **Enquiry-driven conversion model:** "Price on Request" presentation without shopping carts, online checkouts, or public customer logins; pre-filled WhatsApp links, click-to-call actions, and web enquiry forms with honeypot spam protection.
- **Hierarchical catalogue & search:** Multi-level taxonomy across four primary departments (Kitchen, Hardware, Bathroom, Plywood), brand index, multi-column desktop mega-menu, responsive mobile navigation drawer, and real-time client-side search.
- **Private administration dashboard:** Client-side administrative single-page application mounted at `/admin/` with Argon2id password hashing, short-lived JWT access tokens, server-side refresh token rotation, and role-based access control (RBAC).
- **Staff onboarding workflow:** Single-use, time-limited (72-hour) cryptographic invitation tokens; public self-registration is permanently disabled.
- **Atomic SSG publishing pipeline:** Static Site Generation via Astro; admin rebuild trigger compiles pages in an isolated staging workspace and swaps static releases (`deploy/releases/release_TIMESTAMP`) via atomic symlink update (`deploy/current`) with instant rollback support.
- **Media management:** Secure image uploads with file-signature (magic byte) verification, extension validation (JPEG, PNG, WebP), file size limits (10MB), and persistent storage in Docker volumes.
- **Search engine optimization & structured data:** Static HTML generation, dynamic XML sitemaps (`/sitemap.xml`), crawl-safe `robots.txt`, and Schema.org JSON-LD entities (`HomeGoodsStore`, `LocalBusiness`, `Product`, `BreadcrumbList`).
- **Disaster recovery utilities:** Automated shell scripts for atomic database dumps and media archive snapshots.

## Tech stack

| Layer | Technologies | Description |
| :--- | :--- | :--- |
| **Frontend** | Astro 5.3, React 19.0, TypeScript 5.7 | Static site generation, server-rendered layouts, and interactive React islands |
| **UI & Styling** | CSS Custom Properties, React Icons 5.7 | Global responsive tokens, Archivo / IBM Plex Sans typography, Noto Nastaliq Urdu |
| **Backend API** | FastAPI 0.115, Python 3.12, Uvicorn | Asynchronous REST API, typed request/response schemas, and background tasks |
| **Authentication** | Pwdlib (Argon2id), Python-Jose, Cryptography | Cryptographic password hashing, JWT access/refresh token cycle, RBAC |
| **Database & ORM** | PostgreSQL 17, SQLAlchemy 2.0, Alembic 1.14 | Relational persistence, psycopg 3 driver, and automated schema migrations |
| **Web Server** | Nginx (Alpine) | Reverse proxy, static asset delivery, security headers, and gzip compression |
| **Containerization** | Docker, Docker Compose | Three-tier architecture (`hardware-frontend`, `hardware-backend`, `hardware-postgres`) |
| **Testing** | Pytest 8.3, Astro Check, Puppeteer | 105 automated backend tests, static type verification, and E2E browser tests |

## Getting started

### Prerequisites

Ensure the following tools are installed on your host machine:

- **Docker:** version 24.0 or newer
- **Docker Compose:** version 2.20 or newer
- **Node.js:** version 22.x LTS *(optional, only for running frontend tools outside Docker)*
- **Python:** version 3.12 *(optional, only for running backend commands outside Docker)*

### Installation

1. Clone the repository and navigate to the project root:
   ```bash
   git clone <repository-url>
   cd hardware-store
   ```

2. Create a local environment configuration from the template:
   ```bash
   cp .env.example .env
   ```

3. Build and start all three Docker services in detached mode:
   ```bash
   docker compose up --build -d
   ```

4. Verify that all containers are healthy:
   ```bash
   docker compose ps
   ```

5. Apply database schema migrations:
   ```bash
   docker compose exec hardware-backend alembic upgrade head
   ```

6. Seed the database with initial categories, brands, and sample products:
   ```bash
   docker compose exec hardware-backend python -m app.cli seed-db
   ```

7. Bootstrap an initial Super Administrator account:
   ```bash
   docker compose exec hardware-backend python -m app.cli create-admin \
     --email admin@naseerhardware.com \
     --password "YourSecurePassword123!" \
     --name "Store Owner" \
     --role super_admin
   ```

8. Access the running services:
   - **Frontend (English):** [http://localhost/](http://localhost/)
   - **Frontend (Urdu RTL):** [http://localhost/ur/](http://localhost/ur/)
   - **Admin Control Panel:** [http://localhost/admin/](http://localhost/admin/)
   - **Backend API Health:** [http://localhost/api/v1/health](http://localhost/api/v1/health)
   - **Interactive API Documentation:** [http://localhost/api/docs](http://localhost/api/docs)

### Environment variables

The application reads configuration from `.env` in development and from environment variables in production.

| Variable Name | Required / Optional | Description | Development Example |
| :--- | :--- | :--- | :--- |
| `APP_ENV` | Optional | Runtime environment (`development` or `production`). | `development` |
| `DEBUG` | Optional | Toggles debug mode and exposes Swagger docs at `/api/docs`. Must be `False` in production. | `True` |
| `FRONTEND_PORT` | Optional | Host port mapping for Nginx web server. | `80` |
| `POSTGRES_DB` | Optional | PostgreSQL database name. | `hardware_db` |
| `POSTGRES_USER` | Optional | PostgreSQL username. | `hardware_user` |
| `POSTGRES_PASSWORD` | Required in prod | PostgreSQL user password. | `hardware_secure_dev_pass_2026` |
| `POSTGRES_HOST` | Optional | Internal network host for PostgreSQL. | `hardware-postgres` |
| `POSTGRES_PORT` | Optional | Internal database port. | `5432` |
| `DATABASE_URL` | Optional | SQLAlchemy connection string using the psycopg 3 driver. | `postgresql+psycopg://hardware_user:hardware_secure_dev_pass_2026@hardware-postgres:5432/hardware_db` |
| `SECRET_KEY` | Required in prod | Cryptographic signing key for JWT tokens (min. 32 chars in production). | `dev_secret_hardware_store_key_change_in_production_min32chars!` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Optional | Lifespan of admin JWT access tokens in minutes. | `60` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Optional | Lifespan of admin refresh tokens in days. | `7` |
| `INVITATION_TOKEN_EXPIRE_HOURS` | Optional | Lifespan of staff invitation links in hours. | `72` |
| `ADMIN_INITIAL_PASSWORD` | Optional | Default fallback password for initial admin bootstrapping. | `AdminPass123!` |
| `ALLOWED_ORIGINS` | Optional | Comma-separated list of allowed CORS origins. | `http://localhost,http://127.0.0.1` |
| `PUBLIC_SITE_URL` | Optional | Public base URL used for canonical tags, sitemap, and Open Graph metadata. | `http://localhost` |
| `PUBLIC_API_URL` | Optional | Public URL endpoint for client-side API requests via Nginx. | `http://localhost/api/v1` |
| `INTERNAL_API_URL` | Optional | Docker network URL used by Astro SSG during static builds. | `http://hardware-backend:8000/api/v1` |
| `MEDIA_STORAGE_PATH` | Optional | Filesystem path inside containers where uploaded media is stored. | `/data/media` |
| `FRONTEND_DIR` | Optional | Path to frontend source code inside backend container for build triggers. | `/frontend` |
| `STRICT_API` | Optional | When set to `true`, halts SSG builds if the backend API cannot be reached. | `false` |
| `ALLOW_FIXTURE_FALLBACK` | Optional | Allows Astro build to fall back to static fixtures if API is offline (dev only). | `true` |
| `PUBLIC_GSC_VERIFICATION` | Optional | Google Search Console site verification HTML meta content. | `your_gsc_token` |
| `STORE_NAME_EN` | Optional | Display business name in English. | `Naseer Plywood & Hardware` |
| `STORE_NAME_UR` | Optional | Display business name in Urdu. | `نصیر پلائی ووڈ اینڈ ہارڈویئر` |
| `STORE_PHONE` | Optional | Public contact telephone numbers. | `0304-5030046 / 0317-7030847` |
| `STORE_WHATSAPP` | Optional | Store WhatsApp contact number without spaces or plus. | `923177030847` |
| `STORE_ADDRESS_EN` | Optional | Showroom physical location in English. | `Near New Cantt Hospital, Canal Road, Sargodha, Pakistan` |
| `STORE_ADDRESS_UR` | Optional | Showroom physical location in Urdu. | `نزد نیو کینٹ ہسپتال کینال روڈ سرگودھا` |
| `STORE_MAPS_URL` | Optional | Google Maps place profile URL. | `https://maps.app.goo.gl/xmLZoo4WbL5xnffy8` |

### Running in development

To run the full stack with automatic container restarts:
```bash
docker compose up -d
```

To tail logs across all services:
```bash
docker compose logs -f
```

To run the Astro frontend development server directly on the host (with hot reload):
```bash
cd frontend
npm install
npm run dev
```

### Running tests

Run the automated backend test suite (105 test cases covering auth, RBAC, CRUD, media validation, enquiries, and SSG pipeline):
```bash
docker compose exec hardware-backend pytest
```

Run static TypeScript and Astro diagnostic checks:
```bash
npm --prefix frontend run check
```

Run end-to-end browser smoke tests with Puppeteer:
```bash
node tests/e2e/e2e_smoke_test.js
```

### Building for production

To test the frontend static production build locally:
```bash
npm --prefix frontend run build
```

This generates compiled HTML, CSS, JavaScript, dynamic `sitemap.xml`, and `robots.txt` in `frontend/dist/`.

## Project structure

```text
.
├── backend/                  # FastAPI backend application, models, and migrations
│   ├── app/                  # Application source code
│   │   ├── api/v1/           # REST API endpoints (public & admin sub-routers)
│   │   ├── core/             # Configuration, exceptions, security, and hashing
│   │   ├── db/               # SQLAlchemy engine, session factory, and seed script
│   │   ├── models/           # Declarative database entities
│   │   └── schemas/          # Pydantic v2 request and response contracts
│   ├── migrations/           # Alembic database migration revisions (001-004)
│   ├── tests/                # Automated pytest suite (105 integration/unit tests)
│   ├── Dockerfile            # Python 3.12-slim backend container specification
│   └── requirements.txt      # Python runtime dependencies
├── frontend/                 # Astro static frontend and React island components
│   ├── deploy/               # Web root mounted by Nginx (current symlink -> releases/)
│   ├── public/               # Static assets (favicons, brand SVGs, manifest)
│   ├── src/                  # Page routes, components, layouts, and styles
│   │   ├── components/       # Astro UI elements and React administrative islands
│   │   ├── layouts/          # Base HTML layout and SEO meta tags
│   │   ├── pages/            # File-based routing (English `/` and Urdu `/ur/`)
│   │   └── styles/           # Global design tokens and admin dashboard styles
│   ├── Dockerfile            # Multi-stage build (Node 22 builder -> Nginx runner)
│   ├── nginx.conf            # Development Nginx reverse proxy configuration
│   ├── nginx.prod.conf       # Production Nginx reverse proxy with SSL
│   └── package.json          # Node dependencies, Astro scripts, and metadata
├── docs/                     # Specifications and architectural documentation
│   ├── 01-product/           # Requirements, business model, and PRD
│   ├── 02-architecture/      # Architecture overview, tech stack, and decisions (ADRs)
│   ├── 03-design/            # Design system tokens, reference audits, and screenshots
│   ├── 04-database/          # Schema definitions, ERD, and relationships
│   ├── 05-api/               # Public and admin API contracts
│   ├── 06-security/          # RBAC matrix, token lifecycle, and threat models
│   ├── 07-testing/           # Testing strategy and coverage targets
│   ├── 08-seo/               # Bilingual keyword mappings and SEO strategy
│   ├── 09-content/           # Taxonomy and content dictionary
│   └── 10-operations/        # Runbooks, Docker configuration, and deployment guides
├── project-management/       # Roadmap, task register, changelog, and progress logs
├── reference/                # Original design reference PDFs and visual baselines
├── scripts/                  # Operations utilities (backup, restore, secrets generator)
├── shop_photos/              # Authentic showroom photographs and product display assets
├── tests/                    # End-to-end integration test suites (Puppeteer smoke tests)
├── docker-compose.yml        # Development multi-container orchestration definition
└── docker-compose.prod.yml   # Production multi-container orchestration definition
```

## Scripts and commands

| Command | Environment | Description |
| :--- | :--- | :--- |
| `docker compose up --build -d` | Host | Build and start all 3 Docker services in the background. |
| `docker compose down` | Host | Stop and terminate active Docker containers and networks. |
| `docker compose ps` | Host | View status and healthcheck reports for running containers. |
| `docker compose exec hardware-backend pytest` | Host | Run complete backend test suite (105 tests). |
| `docker compose exec hardware-backend alembic upgrade head` | Host | Apply pending Alembic database schema migrations. |
| `docker compose exec hardware-backend python -m app.cli seed-db` | Host | Populate database with default categories, brands, and products. |
| `docker compose exec hardware-backend python -m app.cli create-admin --email <e> --password <p> --name <n> --role <r>` | Host | Bootstrap a new administrative account with designated role. |
| `docker compose exec hardware-backend python -m app.cli reset-password --email <e> --password <p>` | Host | Reset password for an admin user and revoke active sessions. |
| `npm --prefix frontend run dev` | Host | Launch local Astro development server with hot-module replacement. |
| `npm --prefix frontend run check` | Host | Execute TypeScript and Astro type diagnostics across frontend files. |
| `npm --prefix frontend run build` | Host | Compile all English and Urdu static HTML pages into `frontend/dist/`. |
| `npm --prefix frontend run preview` | Host | Locally preview the compiled production static output. |
| `python3 scripts/generate_secrets.py` | Host | Generate high-entropy secrets for production `.env.production`. |
| `bash scripts/backup.sh` | Host | Create atomic snapshot of PostgreSQL database and media storage. |
| `bash scripts/restore.sh <dir>` | Host | Restore PostgreSQL database and media files from backup snapshot. |
| `node tests/e2e/e2e_smoke_test.js` | Host | Run end-to-end Puppeteer browser test suite. |

## Deployment

The production system runs on Docker Compose using three isolated containers communicating over a private bridge network:

```
                      Internet
                         │
                 Ports 80 / 443 (SSL)
                         ▼
        ┌───────────────────────────────────┐
        │         hardware-frontend         │
        │   Nginx Alpine Web Server         │
        │   - Serves static HTML & assets   │
        │   - Proxies /api/ to backend      │
        │   - Serves /media/ from volume    │
        └─────────────────┬─────────────────┘
                          │ (internal network)
                          ▼
        ┌───────────────────────────────────┐
        │          hardware-backend         │
        │   FastAPI (Python 3.12 / Uvicorn) │
        │   - REST API & Admin Logic        │
        │   - Manages /data/media volume    │
        │   - Executes SSG Rebuild Pipeline │
        └─────────────────┬─────────────────┘
                          │ (internal network)
                          ▼
        ┌───────────────────────────────────┐
        │         hardware-postgres         │
        │   PostgreSQL 17 Alpine            │
        │   - Internal Port 5432 only       │
        │   - Not exposed to host network   │
        └───────────────────────────────────┘
```

### Atomic static publishing workflow

1. When catalog modifications occur, a Super Administrator triggers a site rebuild via `POST /api/v1/admin/build/trigger` or through the Admin Dashboard button.
2. The FastAPI backend acquires a PostgreSQL distributed advisory lock (`BUILD_ADVISORY_LOCK_ID = 9876543210123`) to prevent concurrent builds.
3. The backend executes `npm run build` in an isolated staging workspace.
4. Output integrity is validated: the presence of `index.html`, `ur/index.html`, and `sitemap.xml` is verified.
5. The verified build is copied to a timestamped directory: `frontend/deploy/releases/release_TIMESTAMP`.
6. The `frontend/deploy/current` symlink is atomically updated to point to the new release directory using `os.replace()`.
7. Nginx serves requests directly from `deploy/current` with zero downtime.
8. If an issue is detected, administrators can invoke `POST /api/v1/admin/build/rollback` to instantly revert `current` to the previous release.

### Production launch steps

1. Prepare production environment variables:
   ```bash
   cp .env.production.template .env.production
   python3 scripts/generate_secrets.py --env-file .env.production
   ```
2. Verify production domain and SSL certificate paths in `frontend/nginx.prod.conf`.
3. Launch services using the production Compose profile:
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d
   ```
4. Run migrations and create the production administrator:
   ```bash
   docker compose -f docker-compose.prod.yml exec hardware-backend alembic upgrade head
   docker compose -f docker-compose.prod.yml exec hardware-backend python -m app.cli create-admin \
     --email admin@naseerhardware.duckdns.org \
     --password "SecureProductionPassword!" \
     --name "Naseer Ahmed" \
     --role super_admin
   ```

For detailed disaster recovery and runbooks, refer to [docs/10-operations/deployment-and-docker.md](docs/10-operations/deployment-and-docker.md) and [docs/12-operations/backup-and-recovery.md](docs/12-operations/backup-and-recovery.md).

## Contributing

1. Work from feature branches based on `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Follow Conventional Commits formatting (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`).
3. Ensure all quality checks pass prior to opening a Pull Request:
   - Frontend type check: `npm --prefix frontend run check` (0 errors, 0 warnings)
   - Frontend build: `npm --prefix frontend run build` (all static routes compile)
   - Backend test suite: `docker compose exec hardware-backend pytest` (all 105 tests pass)
4. Do not commit `.env`, credentials, database dumps, or private tokens.

<!-- TODO: create CONTRIBUTING.md with community contribution guidelines -->

## License

<!-- TODO: add LICENSE file and specify license holder -->

This project does not currently contain a `LICENSE` file. All rights are reserved by the repository owner.

## Contact and showroom

- **Business Name:** Naseer Plywood & Hardware
- **Physical Address:** Near New Cantt Hospital, Canal Road / General Bus Stand Road, Sargodha, Pakistan
- **Google Maps Location:** [https://maps.app.goo.gl/xmLZoo4WbL5xnffy8](https://maps.app.goo.gl/xmLZoo4WbL5xnffy8)
- **Direct Showroom Telephone:** 0304-5030046 / 0317-7030847
- **WhatsApp Enquiries:** +92 317 7030847
<!-- TODO: confirm live production domain -->
- **Production Domain Target:** `https://naseerhardware.duckdns.org`
