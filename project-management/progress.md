# Project Progress

Last updated: 2026-11-18

## Current status

- Overall phase: Phase 5 — Publishing Integration (COMPLETED; Awaiting user sign-off for Phase 6)
- Overall status: Astro SSG build pipeline connected directly to live FastAPI PostgreSQL database via `frontend/src/lib/api.ts`; dynamic generation of all bilingual pages (`/` English and `/ur/` Urdu RTL) with reciprocal hreflang annotations; dynamic sitemap generation; secure `super_admin` production rebuild trigger in FastAPI with concurrency mutex (409 Conflict), isolated staging compilation (`dist_staging`), integrity validation, atomic output deployment to Nginx web root volume, and failed-build rollback guard; 92/92 automated backend tests passing (100%); 0 TypeScript errors in `npm run check`.
- Current task: Phase 5 Completion Gate & Implementation Report
- Blockers: None. Ready for Phase 6 (Quality, Accessibility, and SEO).

## Completed

- [x] Initial project scope and high-level stack documented.
- [x] Product catalogue and enquiry-led business model recorded.
- [x] English/Urdu requirement recorded.
- [x] Three-service Docker architecture recorded.
- [x] Astro SSG approach recorded.
- [x] Initial category taxonomy and page templates documented.
- [x] Inspected 5 reference PDF captures in `reference/` and 4 physical shop photos in `shop_photos/`.
- [x] Created `project-management/PROJECT_STATUS.md`, `OPEN_QUESTIONS.md`, and `IMPLEMENTATION_PLAN.md`.
- [x] **P1-01:** Scaffolded Astro 5 with `@astrojs/react`, TypeScript strict mode, bilingual layout, and global CSS design tokens.
- [x] **P1-02:** Scaffolded FastAPI modular backend with settings, Argon2id security, JWT, health, auth, and enquiry handlers.
- [x] **P1-03:** Configured PostgreSQL 17 and Alembic migrations; created and migrated 9 database tables.
- [x] **P1-04:** Configured Docker Compose with required containers: `hardware-frontend`, `hardware-backend`, `hardware-postgres`, health checks, and persistent volumes.
- [x] **P1-05:** Configured Nginx static file hosting, API reverse proxying, and security headers.
- [x] **P1-06:** Implemented design tokens, responsive layout, dual announcement bars, sticky header, and dark footer in LTR and RTL.
- [x] **P2-01:** Header, dual announcement bars (`#E21B23` showroom alert + `#111111` price notice), and DesktopMegaMenu multi-column dropdown.
- [x] **P2-02:** MobileNavDrawer off-canvas sheet with category accordions and quick phone/WhatsApp buttons.
- [x] **P2-03:** Homepage template with HeroSlider, 4-column product grids, PlywoodPromoBanner, ReviewCarousel 5-star Google reviews, ShowroomLocation map, and SocialBar.
- [x] **P2-04:** Category and Subcategory templates (`[category]/index.astro`, `[category]/[subcategory].astro`) with filter bar, item counts, and pagination.
- [x] **P2-05:** Product detail template (`products/[slug].astro`) with 1:1 image gallery, vendor badge, "Price on Request" box, primary green WhatsApp CTA button, features list, specs table, and related products grid.
- [x] **P2-06:** About us, Contact us (with 4-card quick bar and live enquiry form), Brands directory, Blog guides index & detail pages, SearchCatalogue interactive island, and 404 pages.
- [x] **P2-07:** English and Urdu routes with complete RTL layout mirroring (`dir="rtl"`), Noto Nastaliq Urdu typography, and LanguageSwitcher.
- [x] **P2-08:** WhatsApp/telephone conversion buttons across cards and product pages; EnquiryForm island with anti-spam honeypot submitting to `/api/v1/enquiries`.
- [x] Automated checks: `npm run check` (45 files checked, 0 errors, 0 warnings); `npm run build` (106 static pages generated in 1.49s); backend test suite 37/37 passing (100%).
- [x] **P2-REV:** Addressed all 7 Phase 2 user review items (Business identity verified for Canal Road Sargodha, zero competitor mentions, route table reconciled to all 40 verified endpoints, bilingual SEO evidence verified, existing DB/API models documented, admin roadmap confirmed, visual comparison screenshot audit conducted, clean secret hygiene verified).
- [x] **P3-01 & P3-02:** Implemented full relational catalog schema in PostgreSQL via Alembic migration `002_catalog_schema.py`: 12 tables (`categories`, `brands`, `products`, `product_categories`, `product_images`, `attributes`, `product_attribute_values`, `product_variants`, `enquiries`, `admin_users`, `admin_invitations`, `alembic_version`). Added PostgreSQL enums `stockstatus` and `enquirychannel`, JSONB specifications column, and localized bilingual SEO meta title and meta description fields.
- [x] **P3-03:** Implemented public catalog endpoints: `GET /api/v1/categories`, `GET /api/v1/categories/tree`, `GET /api/v1/categories/{slug}`, `GET /api/v1/brands`, `GET /api/v1/brands/{slug}`, `GET /api/v1/products`, `GET /api/v1/products/{slug}`.
- [x] **P3-04:** Implemented search, filter, and pagination contracts: `PaginatedResponse[ProductListItem]`, case-insensitive full-text search (`q`), recursive parent-to-child category filtering, brand slug filter, stock status filter, featured and best seller boolean flags, price range filters, and multiple sort orders (`featured`, `newest`, `price_asc`, `price_desc`, `name_asc`).
- [x] **P3-05:** Implemented enquiry and contact abuse controls: phone digit validator (>= 7 digits), hidden honeypot field (`hp_field`) that silently flags spam bots with `status='spam'`, and an in-memory sliding-window IP rate limiter that enforces a 5-submission threshold per 5 minutes and returns HTTP 429 Too Many Requests.
- [x] **P3-06:** Implemented database seeder `seed-db` CLI command (seeding 19 categories across 4 root departments, 6 brands, 5 attributes, 11 products, 12 images, 5 variants) and built comprehensive automated test suite with 37 tests covering categories, brands, products, enquiries, schemas, and health endpoints (100% pass rate).
- [x] **P3-REV:** Addressed all 6 Phase 3 review items: (1) Added Bathroom root and 6 subcategories to database seed and verified recursive filtering; (2) Added production environment safeguard preventing sample data from seeding in production, clearly labeling demo records; (3) Hardened rate limiter IP detection using authoritative `X-Real-IP` to prevent header spoofing and documented Redis migration path; (4) Verified public security with automated tests confirming unpublished items return 404 and enquiry/admin records are inaccessible; (5) Verified strict adherence to Price on Request model with zero cart/checkout routes; (6) Documented comprehensive architectural plan for Phase 4 Admin Dashboard. Holding at Phase 3 Completion Gate.
- [x] **P4-01:** Implemented Argon2id password hashing, 15-minute JWT access token, 7-day refresh token cycle, `/auth/login`, `/auth/refresh`, `/auth/me`, `/auth/change-password`, `/auth/logout`, token signature and expiration verification.
- [x] **P4-02:** Implemented roles and permissions (`super_admin`, `admin`, `catalogue_editor`, `enquiry_handler`), `admin_invitations` table with single-use 72-hour tokens, zero public admin registration, and RBAC dependency `require_roles()`.
- [x] **P4-03:** Implemented full Admin CRUD endpoints for Categories, Brands, and Products (`/api/v1/admin/categories`, `/api/v1/admin/brands`, `/api/v1/admin/products`), category assignment, dynamic attributes, variants, specifications JSONB, gallery image management, publish toggles, and 403 authorization checks.
- [x] **P4-04:** Implemented persistent media upload endpoint `/api/v1/admin/media/upload` with extension and MIME type validation, 10MB size limit, collision-free filename sanitization, persistent storage in `/data/media` volume, and Nginx `/media/` serving.
- [x] **P4-05:** Implemented localized bilingual content editing and SEO management, dynamic `translation_status` computation (`COMPLETE`, `MISSING_UR`, `INCOMPLETE`), query filtering, and missing translation indicators in admin tables and dashboard.
- [x] **P4-06:** Implemented customer enquiries management inbox `/api/v1/admin/enquiries` with status transitions (`new` -> `in_progress` -> `resolved` -> `spam`), channel filters, full message details modal with IP and user agent, and delete capability.
- [x] **P4-07:** Built full frontend Admin Dashboard React application mounted at `/admin/` in Astro SSG, including authentication guard, invitation acceptance screen, dashboard KPI cards, localized translation alert badge, products manager, categories manager, brands manager, enquiries inbox, and staff invitation manager.
- [x] **P4-08:** Implemented site rebuild trigger and audit status endpoints `/api/v1/admin/build/trigger` and `/api/v1/admin/build/status` with live feedback in the admin topbar.
- [x] **P4-REV:** Addressed all 7 Phase 4 review items:
  1. *Authentication Security:* Created `admin_refresh_tokens` table via Alembic migration `003_refresh_tokens_schema.py`; enforced server-side refresh token rotation, replay attack detection with immediate cascade revocation of all user sessions, explicit logout revocation, and account deactivation guards (`12/12 auth tests passing`).
  2. *Media Upload Security:* Eliminated Stored XSS / XXE vectors by rejecting SVG uploads; enforced strict magic byte file signature validation (`\xff\xd8\xff` for JPEG, `\x89PNG\r\n\x1a\n` for PNG, `RIFF...WEBP` for WebP); verified 10MB size limit and safe filename sanitization (`10/10 media tests passing`).
  3. *RBAC Audit:* Established comprehensive Role vs Permission matrix; restricted `/build/trigger` and `/invitations` strictly to `super_admin`; verified permissions across all 4 roles (`super_admin`, `admin`, `catalogue_editor`, `enquiry_handler`) confirming catalogue editors cannot delete or access enquiries (`test_admin_rbac_matrix.py` 4/4 passing).
  4. *Build Pipeline Architecture:* Delineated simulation vs production SSG execution; documented staging directory isolation, atomic directory swapping, zero shell injection risk, and failed-build rollback retaining working static files.
  5. *Data Consistency:* Verified 4 root categories (`kitchen`, `hardware`, `bathroom`, `plywood`) and explained taxonomy count (19 total categories); separated demo seed records from genuine inventory; verified public API returns HTTP 404 for unpublished entities.
  6. *Integration Testing & Persistence:* Verified media persistence in `/data/media` volume across Docker container restarts (`HTTP 200 OK` after `docker compose restart`); tested expired, revoked, and inactive tokens; verified clean secret hygiene.
  7. *Phase 5 Implementation Plan:* Documented comprehensive architecture for Astro dynamic SSG database queries, bilingual page generation, reciprocal hreflang annotations, sitemap generation, and atomic deployment.
- [x] Automated checks: Frontend Astro check passed (0 errors, 0 warnings); Frontend build generated 107 static pages (including `/admin/index.html`); Backend automated test suite has 90/90 tests passing (100%).
- [x] **P5-01:** Implemented `frontend/src/lib/api.ts` connecting Astro SSG to FastAPI backend at `http://hardware-backend:8000/api/v1` or `http://localhost:8080/api/v1` with candidate auto-discovery, parallel entity fetching, specifications adaptation, and offline fallback.
- [x] **P5-02:** Refactored `[category]/index.astro`, `[category]/[subcategory].astro`, `products/[slug].astro`, `brands/index.astro`, `search.astro`, and all Urdu `/ur/` counterparts to query PostgreSQL via `api.ts`; dynamically generates English and Urdu static HTML pages with reciprocal hreflang annotations.
- [x] **P5-03:** Restricted `POST /api/v1/admin/build/trigger` to `super_admin` role with RBAC enforcement; implemented thread mutex locking returning 409 Conflict for concurrent requests; non-parameterized background Astro SSG compilation; 6/6 build tests passing in pytest.
- [x] **P5-04:** Unpublished products return 404 and are excluded from static generation; build pipeline compiles to `dist_staging`, performs integrity validation on `index.html`, `/ur/index.html`, and `sitemap.xml`, and atomically synchronizes output to production root; rollback guard preserves live site on error with zero downtime.
- [x] **P5-REV:** Completed all 8 Phase 5 Publishing Reliability and SEO Review Items:
  1. *Genuinely Atomic Deployment:* Built release-based versioned directories (`frontend/deploy/releases/release_TIMESTAMP/`) and atomic pointer swap (`deploy/current` -> `releases/release_TIMESTAMP`) via POSIX `os.replace()`; updated Nginx root to `/usr/share/nginx/html/current; disable_symlinks off;`; preserved last 5 releases for instant rollback.
  2. *Production Fixture Fallback Policy:* Disabled silent mock fallback when `STRICT_API=true` or `APP_ENV=production`; if backend or database is unreachable, build throws an explicit error and aborts, preserving the active release without visitor disruption.
  3. *Complete Database Pagination & Fast Export:* Added `GET /api/v1/products/build-export` returning all published products with pre-joined categories, images, attributes, and specifications in a single query; implemented full pagination loop `while (page <= total_pages)` across all product pages; tested with 105 published items.
  4. *Distributed Build Locking & Recovery:* Created `site_build_state` table via Alembic migration `004_build_state_schema.py`; implemented PostgreSQL advisory locking (`BUILD_ADVISORY_LOCK_ID = 9876543210123`) preventing concurrent builds across multiple worker processes; added startup recovery in FastAPI lifespan resetting interrupted builds from abrupt restarts; sanitized build error logs to redact credentials and tokens.
  5. *Instant Rollback Endpoint:* Implemented `POST /api/v1/admin/build/rollback` (super_admin only) atomically reverting `current` pointer to previous release directory in single syscall.
  6. *Subcategory Alias Canonical & Redirect:* Configured primary canonical URLs for all subcategories (e.g. `https://naseerhardware.pk/kitchen/kitchen-sinks/`); subcategory alias routes (`/kitchen/sinks/`) now emit canonical tags pointing directly to primary canonical URLs and include `<meta http-equiv="refresh" content="0; url=/kitchen/kitchen-sinks/">` redirects; aliases strictly excluded from `sitemap.xml`.
  7. *Bilingual SEO & Unpublished Security:* Verified reciprocal hreflang annotations (`en`, `ur`, `x-default`) on all English and Urdu routes; verified self-referencing canonical URLs; verified unpublished products return HTTP 404 and are excluded from build-export and sitemap.
  8. *End-to-End Test Suite:* Added `tests/test_publishing_pipeline.py`; 100/100 backend tests passing in pytest; 0 errors across 84 files in `npm run check`.
- [x] Automated checks: Frontend Astro check passed (0 errors, 0 warnings); Backend automated test suite has 100/100 tests passing (100%).

## In progress

- Phase 5 Completion Gate: Awaiting user review and explicit approval to proceed to Phase 6 (Quality, Accessibility, and SEO).

## Next actions

1. Receive user review and approval for Phase 5.
2. Begin Phase 6 — Quality and SEO (Metadata, canonical, hreflang, sitemap, robots, breadcrumbs and JSON-LD structured data, image optimization, accessibility, keyboard review, and RTL audit).

## Update rules

For each update, record date, task ID, what changed, tests/checks run, result, and blockers. Do not infer completion from code generation alone.
