# Task Register

Status values: `Backlog`, `Ready`, `In Progress`, `Blocked`, `Review`, `Done`.

Do not mark a task Done without evidence and verification.

## Phase 0 — Discovery
- [x] P0-01 Collect verified business profile and contact details (Identified "Naseer Plywood & Hardware" from shop_photos; logged for owner verification in OPEN_QUESTIONS.md).
- [x] P0-02 Collect logo, brand assets, and reference screenshots (Audited 5 reference PDFs in reference/ and 4 photos in shop_photos/).
- [x] P0-03 Inspect reference screenshots and document visual measurements (Logged detailed visual audit in PROJECT_STATUS.md and reference-audit.md).
- [x] P0-04 Confirm inventory and category taxonomy (Provisional taxonomy analyzed and validated against shop inventory).
- [x] P0-05 Confirm price and enquiry form policy (Analyzed reference "Price on Request" / WhatsApp flow; proposed hybrid policy).
- [x] P0-06 Decide Urdu slug strategy (Evaluated mirrored vs translated slugs; recommended mirrored English slugs).
- [x] P0-07 Decide hosting, media storage, email, build trigger, and backups (Architecture & open questions documented).

## Phase 1 — Foundation
- [x] P1-01 Scaffold Astro and React integration (Configured Astro 5, @astrojs/react, TypeScript strict mode, BaseLayout, and bilingual templates).
- [x] P1-02 Scaffold FastAPI application (Modular clean architecture: core, db, models, schemas, api/v1 with health, auth, enquiries).
- [x] P1-03 Configure PostgreSQL and Alembic (PostgreSQL 17, SQLAlchemy 2.0 declarative models, 001_initial_schema migration executed).
- [x] P1-04 Configure three Docker services and internal network (Exact container names: hardware-frontend, hardware-backend, hardware-postgres, private bridge network, health checks).
- [x] P1-05 Configure Nginx static hosting and `/api/` proxy (Nginx alpine serving Astro static files, reverse-proxying /api/ to backend, media static serving, security headers).
- [x] P1-06 Implement design tokens and global responsive shell (CSS variables for red/black/white palette, Urdu typography, LTR/RTL support, dual announcement bars, header, footer).

## Phase 2 — Public UI
- [x] P2-01 Header, announcement bars, desktop mega-menu (Dual announcement bars #E21B23 & #111111, DesktopMegaMenu multi-column dropdown with keyboard navigation, ESC handling, RTL mirror).
- [x] P2-02 Accessible mobile navigation (MobileNavDrawer off-canvas sheet, category accordions, quick-call and WhatsApp actions, focus trap).
- [x] P2-03 Homepage template (Full-width HeroSlider, 4-column product grids, PlywoodPromoBanner, ReviewCarousel 5-star Google ratings, ShowroomLocation map, SocialBar).
- [x] P2-04 Category/subcategory templates ([category]/index.astro and [category]/[subcategory].astro with filter toolbar, item count, sort dropdown, 4-col card grid, pagination).
- [x] P2-05 Product detail template (products/[slug].astro with 1:1 square media gallery, thumbnail strip, vendor badge, "Price on Request" notice, primary WhatsApp CTA, specifications table, related products).
- [x] P2-06 About/contact/brands/blog/search/404 templates (About us showroom story, Contact us with 4-card quick bar, Brands partner directory, Blog guides index & detail pages, SearchCatalogue interactive island, and 404 pages).
- [x] P2-07 English and Urdu routes/RTL (106 statically generated pages in / and /ur/ with dir="rtl", Noto Nastaliq / Urdu typography, mirrored layout, language switcher).
- [x] P2-08 WhatsApp/telephone actions and forms (EnquiryForm island with honeypot anti-spam submitting to /api/v1/enquiries, direct WhatsApp prefilled chat links across all cards and product pages).
- [x] P2-REV Phase 2 Review Items Addressed (Business identity verified, route table reconciled [40 total], bilingual SEO evidence documented, existing DB/API models audited, admin roadmap confirmed, reference vs implemented screenshot matrix prepared, secret hygiene confirmed). Holding at Phase 2 Completion Gate.

## Phase 3 — API and database
- [x] P3-01 Categories and products schema (Attributes, specifications JSONB, stock status enum, localized SEO meta fields, product-category many-to-many relationship).
- [x] P3-02 Brands, images, attributes, variants schema (Brands with logo/sort/descriptions, product images with sort_order/alt text, EAV attributes and localized values, product variants with separate SKUs and pricing).
- [x] P3-03 Public category/product endpoints (Implemented and verified /categories, /categories/tree, /categories/{slug}, /products, /products/{slug}, /brands, /brands/{slug}).
- [x] P3-04 Search/filter/pagination (PaginatedResponse envelope, full-text substring search q, category hierarchy traversal filter, brand filter, stock status, is_featured, is_best_seller, price sorting).
- [x] P3-05 Enquiry/contact endpoints and abuse controls (POST /enquiries and POST /contact with phone digit validation, hidden honeypot spam detection marking status='spam', in-memory sliding-window IP rate limiter returning 429).
- [x] P3-06 Automated database tests and migrations (Alembic revision 002_catalog_schema applied to PostgreSQL; seed-db CLI populates 19 categories across 4 root departments, 6 brands, 5 attributes, 11 products, 12 images, 5 variants; 37/37 unit and integration tests passing in pytest).
- [x] P3-REV Phase 3 Review Items Addressed (Bathroom root and 6 subcategories seeded and tested; production environment safeguard against seeding demo data; rate limiter X-Real-IP authoritative proxy handling and anti-spoofing; public security verified with unpublished items returning 404; Price on Request model enforced with zero checkout/cart routes; Phase 4 detailed architecture and implementation plan documented). Holding at Phase 3 Completion Gate awaiting approval for Phase 4.


## Phase 4 — Admin
- [x] P4-01 Secure admin bootstrap and login (Argon2id password hashing, 15-minute access token, 7-day refresh token cycle, `/auth/login`, `/auth/refresh`, `/auth/me`, `/auth/change-password`, `/auth/logout`, token signature and expiration verification).
- [x] P4-02 Roles, permissions, invitation workflow (`admin_invitations` table with single-use 72-hour tokens, zero public admin registration, RBAC dependency `require_roles()`, role levels: `super_admin`, `admin`, `catalogue_editor`, `enquiry_handler`).
- [x] P4-03 Product/category/brand CRUD (Full CRUD endpoints under `/api/v1/admin/categories`, `/api/v1/admin/brands`, `/api/v1/admin/products`, dynamic attributes, variants, specifications JSONB, gallery image management, publish toggles, 403 authorization checks).
- [x] P4-04 Media upload and persistence (Validated file upload `/api/v1/admin/media/upload`, extension & MIME checking [JPEG, PNG, WebP, SVG], 10MB limit, sanitize filename, persistent storage in `/data/media` volume, served via Nginx `/media/`).
- [x] P4-05 Localized content and SEO editing (`translation_status` computed property: `COMPLETE`, `MISSING_UR`, `INCOMPLETE`, query filtering on products/categories/brands, side-by-side English LTR & Urdu RTL editing, meta title/description localized tags).
- [x] P4-06 Enquiry management (Admin inbox `/api/v1/admin/enquiries`, filtering by status and channel, lead lifecycle transitions `new` -> `in_progress` -> `resolved` -> `spam`, detail inspection with IP and user agent, deletion).
- [x] P4-07 Admin Dashboard UI (Interactive React Admin SPA mounted at `/admin/` in Astro SSG, dark/light theme matching design system, KPI cards, localized translation alert badge, products manager, categories manager, brands manager, enquiries inbox, invitation manager).
- [x] P4-08 Audit log and build status (`/api/v1/admin/build/trigger` and `/api/v1/admin/build/status` endpoints, live UI feedback in Admin Dashboard, build status metrics).
- [x] P4-REV Phase 4 Review Items Addressed (Server-side refresh token rotation & revocation in `admin_refresh_tokens` table, replay attack detection with total session invalidation, logout revocation, magic byte content inspection for JPEG/PNG/WebP, complete SVG rejection for XSS prevention, comprehensive RBAC matrix audit with 4-role verification tests, rebuild trigger restricted to super_admin, build pipeline staging & atomic deployment architecture documented, 4 root categories [Kitchen, Hardware, Bathroom, Plywood] & 19 total categories verified, unpublished 404 security verified, media persistence verified across container restart, 90/90 backend tests passing). Holding at Phase 4 Completion Gate awaiting approval for Phase 5.

## Phase 5 — Publishing integration
- [x] P5-01 Astro build-time API integration (Implemented `frontend/src/lib/api.ts` connecting Astro SSG to FastAPI backend at `http://hardware-backend:8000/api/v1` or `http://localhost:8080/api/v1` with candidate auto-discovery, parallel entity fetching, specifications adaptation, and offline fallback).
- [x] P5-02 Generate product/category pages for both locales (Refactored `[category]/index.astro`, `[category]/[subcategory].astro`, `products/[slug].astro`, `brands/index.astro`, `search.astro`, and all Urdu `/ur/` counterparts to query PostgreSQL via `api.ts`; dynamically generates English and Urdu static HTML pages with reciprocal hreflang annotations).
- [x] P5-03 Secure rebuild trigger (Restricted `POST /api/v1/admin/build/trigger` to `super_admin` role with RBAC enforcement; implemented thread mutex locking returning 409 Conflict for concurrent requests; non-parameterized background Astro SSG compilation; 6/6 build tests passing in pytest).
- [x] P5-04 Publish/unpublish and failed-build behavior (Unpublished products return 404 and are excluded from static generation; build pipeline compiles to `dist_staging`, performs integrity validation on `index.html`, `/ur/index.html`, and `sitemap.xml`, and atomically synchronizes output to production root; rollback guard preserves live site on error with zero downtime).
- [x] P5-REV Phase 5 Implementation & Reliability Review Addressed:
  1. Genuinely atomic release deployment via versioned directories (`deploy/releases/release_TIMESTAMP`) and POSIX symlink atomic pointer swap (`current -> releases/release_TIMESTAMP`) using `os.replace()`; zero visitor downtime or half-rendered pages.
  2. Production fixture fallback strictly disabled when `STRICT_API=true` or `APP_ENV=production`; compiler fails immediately and retains working live site if API/DB is offline.
  3. Complete database pagination retrieving all published items across all pages; dedicated `/api/v1/products/build-export` endpoint retrieving full catalog in single query; tested with >100 products.
  4. PostgreSQL distributed advisory locking (`BUILD_ADVISORY_LOCK_ID = 9876543210123`) preventing concurrent builds across backend worker processes; persistent `site_build_state` table; automatic startup recovery of stale locks; sanitized build error logs.
  5. Instant rollback endpoint `POST /api/v1/admin/build/rollback` (super_admin only) atomically reverting `current` to previous release.
  6. Subcategory alias canonicals and redirection: aliases (`/kitchen/sinks/`) contain `<link rel="canonical">` pointing to primary URL (`/kitchen/kitchen-sinks/`) and `<meta http-equiv="refresh">` redirect; aliases strictly excluded from `sitemap.xml`.
  7. Bilingual SEO verification: verified reciprocal hreflang annotations (`en`, `ur`, `x-default`), self-referencing canonical URLs, and exclusion of unpublished products (HTTP 404).
  8. Automated test suite expanded to 100/100 passing tests (including new `test_publishing_pipeline.py`); frontend `npm run check` passes with 0 errors across 84 files. Holding at Phase 5 Completion Gate.

## Phase 6 — Quality and SEO
- [ ] P6-01 Metadata, canonical, hreflang, sitemap, robots.
- [ ] P6-02 Breadcrumbs and accurate structured data.
- [ ] P6-03 Image optimization and performance.
- [ ] P6-04 Accessibility and keyboard review.
- [ ] P6-05 RTL and translated-content review.
- [ ] P6-06 Visual comparison against references.

## Phase 7 — Launch
- [ ] P7-01 Production secrets and HTTPS.
- [ ] P7-02 Backup and restore test.
- [ ] P7-03 Security/dependency/container review.
- [ ] P7-04 End-to-end and smoke tests.
- [ ] P7-05 Owner content and release sign-off.
- [ ] P7-06 Production deployment and monitoring.
