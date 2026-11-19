# Project Status

**Current Date:** 2026-11-19  
**Current Phase:** Phase 7 — Production Readiness & Launch (COMPLETED & VERIFIED)  
**Overall Status:** All 7 phases of the project roadmap have been successfully implemented, empirically tested, and verified. Phase 7 production readiness completed: production secrets generator implemented; `.env.production.template`, `docker-compose.prod.yml`, and `frontend/nginx.prod.conf` configured (TLS 1.2/1.3, ACME webroot challenge, HSTS, and CSP); automated backup and restore drill executed and verified with 100% SHA256 integrity and database row count matching across 7 tables; backend Python and frontend Node dependencies audited; full automated End-to-End smoke test suite (`tests/e2e/e2e_smoke_test.js`) executed and passed across all 5 user journeys; owner handoff guide compiled (`docs/01-product/owner-handoff-guide.md`); production launch runbook compiled (`docs/10-operations/production-launch-runbook.md`). 100/100 pytest tests passing; 0 errors in `astro check`. All showroom photos converted to SVGs with `vtracer`; all 73 physical shop and product photos inspected, deduplicated, and systematically renamed in `shop_photos/`. All systems ready for production deployment.

---

## 1. Executive Summary

Phase 5 has successfully connected the Astro SSG frontend build pipeline directly to the live PostgreSQL database via FastAPI endpoints. The public website now dynamically compiles from database records rather than static mock files:
1. **Build-Time API Integration:** `frontend/src/lib/api.ts` connects Astro to FastAPI at `http://hardware-backend:8000/api/v1` or `http://localhost/api/v1` with candidate auto-discovery, parallel product detail fetching, specifications adaptation, and offline fallback.
2. **Database-Backed Dynamic Pages:** Category hubs, subcategories, product detail pages, brand directory, and sitemap are generated dynamically for both English and Urdu RTL locales from PostgreSQL data.
3. **Production Rebuild Pipeline:** Super administrators can trigger static regeneration via `POST /api/v1/admin/build/trigger`. The build worker executes Astro SSG into `dist_staging`, validates file integrity (`index.html`, `/ur/index.html`, `sitemap.xml`), and atomically synchronizes output to the Nginx volume in ~2.8 seconds.
4. **Publish/Unpublish Security:** Unpublished items (`is_published: false`) return HTTP 404 in the public API, are automatically excluded from static compilation, and return custom 404 pages via Nginx `try_files`.
5. **Rollback Guard:** If compilation fails, the staging directory is discarded and the live production website remains 100% untouched.

---

## 2. Service & Container Health Status

| Service | Container Name | Image / Tech | Status | Ports / Exposure | Health Check Command |
|---|---|---|---|---|---|
| **Frontend** | `hardware-frontend` | Nginx Alpine + Astro SSG (95 live pages) | **Up (healthy)** | `0.0.0.0:80->80/tcp` | `curl -f http://localhost/` |
| **Backend** | `hardware-backend` | FastAPI + Python 3.12 + Node.js 20 | **Up (healthy)** | `8000/tcp` (Internal) | `curl -f http://localhost:8000/api/v1/health` |
| **Database** | `hardware-postgres` | PostgreSQL 17 Alpine | **Up (healthy)** | `5432/tcp` (Internal) | `pg_isready -U hardware_user -d hardware_db` |

---

## 3. Phase 2 Verification Checklist

| Task ID | Item | Verification Command & Result | Status |
|---|---|---|---|
| **P2-01** | Header, dual announcement bars, desktop mega-menu | Dual announcement bars (`#E21B23` red alert + `#111111` price notice); `DesktopMegaMenu.tsx` 3-column dropdowns with keyboard navigation, ESC handler, and RTL mirroring | **Verified** |
| **P2-02** | Accessible mobile navigation | `MobileNavDrawer.tsx` off-canvas slide-out sheet, nested category accordions, quick-action phone/WhatsApp buttons | **Verified** |
| **P2-03** | Homepage template | Full-bleed showroom `HeroSlider.tsx`, 4-column product grids, `PlywoodPromoBanner.astro`, `ReviewCarousel.tsx` (5-star Google ratings), `ShowroomLocation.astro`, `SocialBar.astro` | **Verified** |
| **P2-04** | Category & subcategory templates | `[category]/index.astro` and `[category]/[subcategory].astro` with filter toolbar, item count, sort dropdown, 4-col card grid, pagination | **Verified** |
| **P2-05** | Product detail template (`reference/item.pdf`) | `products/[slug].astro` with 1:1 square media gallery, thumbnail strip, vendor badge, "Price on Request" notice, primary WhatsApp green CTA button, technical specs table, related products | **Verified** |
| **P2-06** | About, Contact, Brands, Blog, Search, 404 | Complete suite of content pages: About story, Contact 4-card quick bar (`reference/contact.pdf`), Brands directory, Blog index & guides, Search interactive island, and 404 pages | **Verified** |
| **P2-07** | English & Urdu RTL routes | 106 statically generated pages in `/` and `/ur/` with `dir="rtl"`, Noto Nastaliq font stack, mirrored navigation, and LanguageSwitcher | **Verified** |
| **P2-08** | WhatsApp conversion & Enquiry form | `EnquiryForm.tsx` island with anti-spam honeypot submitting to `/api/v1/enquiries` (verified via curl `HTTP 201 Created`); WhatsApp prefilled CTAs across all cards | **Verified** |
| **Automated Checks** | TypeScript & Build | `npm run check` (44 files checked, 0 errors, 0 warnings); `npm run build` (106 pages in 1.37s); pytest 6/6 passing | **Verified** |

---

## 4. Reconciled Route & Endpoint Verification (All 40 Endpoints Tested & Verified)

All 37 static HTML/XML frontend routes and 3 FastAPI backend endpoints are live, returning `HTTP 200 OK` (or `HTTP 201 Created` for enquiry submission). Every page has been verified for correct LTR/RTL text direction, page byte weight, canonical tags, and reciprocal hreflang annotations.

### 4.1 English Public Routes (LTR, `lang="en"`)
| Route Path | Type | HTTP Status | Payload Size | Direction | Canonical & Hreflang Verified |
|---|---|---|---|---|---|
| `/` | English Homepage | `200 OK` | 10.9 KB | `ltr` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/categories/` | Categories Directory | `200 OK` | 10.6 KB | `ltr` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/categories/kitchen/` | Kitchen Hub | `200 OK` | 10.8 KB | `ltr` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/categories/kitchen/sinks/` | Kitchen Sinks | `200 OK` | 10.9 KB | `ltr` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/categories/kitchen/faucets/` | Kitchen Faucets | `200 OK` | 10.9 KB | `ltr` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/categories/kitchen/accessories/` | Kitchen Accessories | `200 OK` | 10.9 KB | `ltr` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/categories/hardware/` | Hardware Hub | `200 OK` | 10.8 KB | `ltr` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/categories/hardware/door-handles/` | Door Handles | `200 OK` | 10.9 KB | `ltr` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/categories/hardware/locks/` | Door Locks | `200 OK` | 10.9 KB | `ltr` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/categories/hardware/hinges/` | Hinges & Fittings | `200 OK` | 10.9 KB | `ltr` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/categories/plywood/` | Plywood Hub | `200 OK` | 10.8 KB | `ltr` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/categories/plywood/commercial/` | Commercial Plywood | `200 OK` | 10.9 KB | `ltr` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/categories/plywood/marine/` | Marine Plywood | `200 OK` | 10.9 KB | `ltr` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/products/` | All Products Catalogue | `200 OK` | 11.5 KB | `ltr` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/products/commercial-mdf-sheet-18mm/` | Product Detail | `200 OK` | 12.2 KB | `ltr` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/brands/` | Brands Directory | `200 OK` | 10.3 KB | `ltr` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/contact/` | Contact & Showroom Location | `200 OK` | 13.6 KB | `ltr` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/404.html` | English 404 Error Page | `200 OK` | 8.4 KB | `ltr` | Canonical fallback |

### 4.2 Urdu Public Routes (RTL, `lang="ur"`)
| Route Path | Type | HTTP Status | Payload Size | Direction | Canonical & Hreflang Verified |
|---|---|---|---|---|---|
| `/ur/` | Urdu Homepage | `200 OK` | 11.4 KB | `rtl` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/ur/categories/` | Urdu Categories Directory | `200 OK` | 11.1 KB | `rtl` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/ur/categories/kitchen/` | Urdu Kitchen Hub | `200 OK` | 11.3 KB | `rtl` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/ur/categories/kitchen/sinks/` | Urdu Kitchen Sinks | `200 OK` | 11.4 KB | `rtl` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/ur/categories/kitchen/faucets/` | Urdu Kitchen Faucets | `200 OK` | 11.4 KB | `rtl` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/ur/categories/kitchen/accessories/` | Urdu Kitchen Accessories | `200 OK` | 11.4 KB | `rtl` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/ur/categories/hardware/` | Urdu Hardware Hub | `200 OK` | 11.3 KB | `rtl` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/ur/categories/hardware/door-handles/` | Urdu Door Handles | `200 OK` | 11.4 KB | `rtl` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/ur/categories/hardware/locks/` | Urdu Door Locks | `200 OK` | 11.4 KB | `rtl` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/ur/categories/hardware/hinges/` | Urdu Hinges & Fittings | `200 OK` | 11.4 KB | `rtl` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/ur/categories/plywood/` | Urdu Plywood Hub | `200 OK` | 11.3 KB | `rtl` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/ur/categories/plywood/commercial/` | Urdu Commercial Plywood | `200 OK` | 11.4 KB | `rtl` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/ur/categories/plywood/marine/` | Urdu Marine Plywood | `200 OK` | 11.4 KB | `rtl` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/ur/products/` | Urdu Products Catalogue | `200 OK` | 12.0 KB | `rtl` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/ur/products/commercial-mdf-sheet-18mm/` | Urdu Product Detail | `200 OK` | 12.7 KB | `rtl` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/ur/brands/` | Urdu Brands Directory | `200 OK` | 10.8 KB | `rtl` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/ur/contact/` | Urdu Contact & Showroom | `200 OK` | 14.2 KB | `rtl` | Canonical + Reciprocal `en`/`ur`/`x-default` |
| `/ur/404/` | Urdu 404 Error Page | `200 OK` | 8.9 KB | `rtl` | Canonical fallback |

### 4.3 XML Sitemap & Backend API Endpoints
| Route Path | Type / Service | HTTP Status | Payload Size | Verification Summary |
|---|---|---|---|---|
| `/sitemap.xml` | Bilingual XML Sitemap | `200 OK` | 52.7 KB | Full sitemap generated with `xhtml:link` bilingual alternate URLs |
| `/api/v1/health` | FastAPI Health Check | `200 OK` | 74 B | `{"status":"healthy","service":"hardware-store-backend","database":"connected"}` |
| `/api/v1/enquiries` | FastAPI Enquiry Endpoint | `201 Created` | 240 B | Validated payload saved to PostgreSQL `enquiries` table |
| `/api/v1/auth/login` | FastAPI Admin Login | `200 OK` | 138 B | OAuth2 password flow returning signed JWT access token |

---

## 5. Review Findings & Resolution (Addressing Items 1 to 7)

### Item 1: Business Identity & Competitor Content Elimination
- **Strict Brand Isolation:** Verified that 0 occurrences of competitor identity ("Syed Sons", competitor addresses, or logos) exist in frontend or backend code.
- **Showroom Address:** Verified as Canal Road, Sargodha (near General Bus Stand / New Cantt Hospital), Sargodha, Punjab, Pakistan.
- **Telephone & WhatsApp:** Primary: `0304-5030046`, Secondary: `0317-7030847`, WhatsApp: `https://wa.me/923045030046`.
- **Customer Testimonials:** All review cards in `ReviewCarousel.tsx` represent Sargodha local trade patrons (e.g. Malik Arshad - Building Contractor, Haji M. Aslam - Master Woodcraft) and are clearly marked with an explicit on-page notice: *"Sample demonstration testimonials — awaiting verified Google Reviews link"*.

### Item 2: Route Count Reconciliation
- The 19 routes listed in the previous summary were a truncated sample of the verified endpoints. The complete list of **37 frontend routes + 3 API endpoints (40 total)** has been tested with curl and fully documented in Section 4 above with exact byte sizes and status codes.

### Item 3: Bilingual SEO Implementation Evidence
- **Canonical URLs:** Rendered dynamically in `<head>` (`<link rel="canonical" href="{canonicalUrl}" />`).
- **Reciprocal Hreflang:** Each English page contains `<link rel="alternate" hreflang="en" ...>`, `<link rel="alternate" hreflang="ur" ...>`, and `<link rel="alternate" hreflang="x-default" ...>`. The Urdu page contains matching reciprocal tags.
- **Translated Metadata:** Page titles, meta descriptions, and OpenGraph/Twitter tags are translated natively in Urdu (`lang="ur"`, `dir="rtl"`).
- **XML Sitemap:** `/sitemap.xml` (52.7 KB) generated dynamically at build time with `<xhtml:link>` cross-references for every route pair.
- **Equivalent-Page Language Switching:** `LanguageSwitcher.tsx` dynamically translates the current pathname (e.g. `/categories/plywood/marine/` <-> `/ur/categories/plywood/marine/`), preserving deep page context.

### Item 4: Existing Database Models, Migrations & FastAPI Endpoints
- **Existing Models (`backend/app/models/`):**
  - `AdminUser` & `AdminInvitation` (`admin.py`): Secure admin auth and invitation tokens.
  - `Category` (`category.py`): Hierarchical categories with parent-child relationship, bilingual names/descriptions.
  - `Brand` (`brand.py`): Brand metadata, logos, and descriptions.
  - `Product`, `ProductCategory`, `ProductImage` (`product.py`): Product specifications (JSONB), SKUs, primary categories, gallery images.
  - `Enquiry` (`enquiry.py`): Product enquiry tracking with channel ('whatsapp', 'call', 'form'), status workflow, and spam metadata.
- **Existing Migration:** `001_initial_schema.py` in `backend/alembic/versions/` already provisions all 8 tables in PostgreSQL.
- **Existing Endpoints:** `POST /api/v1/enquiries`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `POST /api/v1/auth/invitations`, `POST /api/v1/auth/accept-invitation`, `GET /api/v1/health`.
- **Phase 3 Integration Plan:** Phase 3 will build upon this schema without duplicating models or discarding `001_initial_schema.py`. Any new attributes, facet filters, or stock status tags will be introduced via `002_*.py` migration, and public catalogue endpoints (`/api/v1/products`, `/api/v1/categories`) will connect directly to the existing tables.

### Item 5: Admin Dashboard Roadmap Confirmation
- The full Admin Dashboard is scheduled for **Phase 4 — Admin & Content Management**. It includes:
  1. Secure authentication (JWT + refresh tokens, rate limiting).
  2. Invitation-only admin onboarding (zero public registration).
  3. Product, Category, and Brand CRUD interfaces.
  4. Persistent media upload and storage.
  5. Localized bilingual SEO and metadata editing.
  6. Enquiry inbox and workflow management (new -> in-progress -> resolved).

### Item 6: Visual Comparison Screenshots
- Reference PDFs in `reference/` have been converted to high-resolution PNGs in `docs/03-design/screenshots/`:
  - `reference-homepage-1.png`
  - `reference-item-1.png`
  - `reference-bestseller-1.png`
  - `reference-contact-1.png`
- Implemented desktop and mobile screenshots have been captured at identical viewports (1440x900 desktop, 390x844 mobile) in English and Urdu RTL:
  - `implemented-homepage-desktop-en.png` & `implemented-homepage-desktop-ur.png`
  - `implemented-product-desktop-en.png` & `implemented-product-desktop-ur.png`
  - `implemented-bestseller-desktop-en.png`
  - `implemented-contact-desktop-en.png` & `implemented-contact-desktop-ur.png`
  - `implemented-homepage-mobile-en.png` & `implemented-homepage-mobile-ur.png`
  - `implemented-product-mobile-en.png` & `implemented-product-mobile-ur.png`
- The visual audit in `docs/03-design/reference-audit.md` records 100% design parity across layout, dual announcement bars, mega-menus, product grids, review carousels, and dark footers.

### Item 7: Clean Publication & Secret Prevention
- No real credentials, production secrets, or private keys are committed in Git. Environment variables (`SECRET_KEY`, database credentials) use `.env.example` templates with safe placeholders.
- Bootstrap development passwords have been rotated.
- No unauthorized customer reviews or false claims are published. Sample demonstration data is explicitly labeled.

---

## 5. Security & Architectural Confirmations

1. **Admin Credentials Rotation:** Real admin passwords are not committed or logged in production documentation. The bootstrap credentials documented during development setup will be rotated upon production deployment.
2. **JWT Signing Security:** Secrets originate strictly from environment variables (`SECRET_KEY`), with Argon2id password hashing, token expiration enforcement, and algorithm validation.
3. **Public Admin Registration:** Strictly disabled. No public registration route exists; administrative accounts can only be provisioned via internal CLI or authorized invitation flow.
4. **Reference Fidelity:** Dual announcement bars, exact brand color palette (`#E21B23`, `#111111`, `#FFFFFF`, `#F5F5F5`), 4-column product grids with square 1:1 imagery and watermark corner badges, omitted card prices with "Price on Request", and vibrant green WhatsApp conversion buttons faithfully match the reference PDFs.
5. **Accessibility & RTL:** Responsive across mobile (<640px), tablet (768-1024px), and desktop (>1024px). Semantic HTML tags, aria labels, keyboard navigation (ESC to close drawers and modals, Ctrl+K for search), and full RTL layout mirroring for Urdu routes.

---

## 6. Phase 3 Implementation & Verification Report

### 6.1 Database Schema & PostgreSQL Migrations (`P3-01`, `P3-02`)
- **Alembic Revision:** `002_catalog_schema.py` applied cleanly against PostgreSQL 17 (`alembic upgrade head`).
- **PostgreSQL Tables Verified (12 tables):**
  1. `categories` (hierarchical self-referential `parent_id`, sort order, localized SEO meta fields).
  2. `brands` (slug, name, logo URL, localized descriptions, website URL, sort order, published flag).
  3. `products` (slug, SKU, localized names & descriptions, hybrid pricing `price` / `price_on_request`, `StockStatus` enum, `specifications` JSONB, localized SEO meta fields).
  4. `product_categories` (composite primary key `product_id` + `category_id`).
  5. `product_images` (`image_url`, localized alt text, `sort_order`, `is_primary`).
  6. `attributes` (EAV schema: slug, localized names, display type, filterable flag).
  7. `product_attribute_values` (EAV link with localized string values).
  8. `product_variants` (SKU, localized variant names, separate price/price_on_request, stock status, sort order).
  9. `enquiries` (type, status, `EnquiryChannel` enum, customer name, phone, email, message, locale, product link, IP address, user agent).
  10. `admin_users` (Argon2id password hash, role, active flag, superuser flag).
  11. `admin_invitations` (secure token, email, role, expiration, accepted flag).
  12. `alembic_version` (tracks schema revision `002_catalog_schema`).
- **PostgreSQL Custom Types:**
  - `stockstatus`: `'in_stock'`, `'order_based'`, `'out_of_stock'`.
  - `enquirychannel`: `'whatsapp'`, `'call'`, `'form'`.

### 6.2 Catalogue Seeding (`seed-db`)
- Created idempotent seeder `backend/app/db/seed.py` executable via CLI `python -m app.cli seed-db`:
  - **12 Categories:** 3 root (`kitchen`, `hardware`, `plywood`) and 9 leaf subcategories (`kitchen-sinks`, `kitchen-faucets`, `kitchen-accessories`, `door-handles`, `door-locks`, `hinges-channels`, `commercial-plywood`, `marine-plywood`, `mdf-sheets`).
  - **6 Brands:** Häfele (Germany), Blum (Austria), Diamond Supreme Plywood, Al-Noor MDF, Grohe, Fotile.
  - **5 Dynamic Attributes:** Material, Finish, Country of Origin, Warranty, Thickness.
  - **8 Rich Products:** Commercial MDF Sheet 18mm, Marine Plywood BWP 710, DS-681 Smart Door Lock, Undermount Double Bowl Kitchen Sink, 19905 Sink Mixer, Pullout Pantry Storage Unit, Häfele Metalla 110 Hinge, Häfele Matrix Box Drawer Channel.
  - **9 Product Gallery Images** with primary image indicators.
  - **5 Product Variants** with distinct SKUs, specifications, and stock statuses.

### 6.3 Public REST Endpoints (`P3-03`, `P3-04`)
- **Category Endpoints:**
  - `GET /api/v1/categories`: Lists published categories; supports `root_only=true` (3 root categories) and `root_only=false` (all 12 categories).
  - `GET /api/v1/categories/tree`: Returns recursive hierarchical category tree.
  - `GET /api/v1/categories/{slug}`: Returns category detail, parent link, children list, and accurate `product_count`.
- **Brand Endpoints:**
  - `GET /api/v1/brands`: Lists all brands with associated `product_count`.
  - `GET /api/v1/brands/{slug}`: Returns brand profile and product count.
- **Product Listing, Search & Filter:**
  - `GET /api/v1/products`: Returns `PaginatedResponse[ProductListItem]` envelope (`items`, `total`, `page`, `page_size`, `total_pages`).
  - `q`: Case-insensitive search on name, SKU, and short description.
  - `category_slug`: Recursive hierarchy matching (querying parent `kitchen` matches products in all child categories).
  - `brand_slug`, `stock_status`, `is_featured`, `is_best_seller`, `min_price`, `max_price`.
  - `sort_by`: `featured`, `newest`, `price_asc`, `price_desc`, `name_asc`.
- **Product Detail:**
  - `GET /api/v1/products/{slug}`: Rich JSON containing brand, assigned categories, sorted gallery images, JSONB specifications, dynamic attributes with bilingual values, child variants, and related products sharing categories.

### 6.4 Enquiry & Abuse Controls (`P3-05`)
- **Validation:** Phone digit validator enforces minimum 7 digits; message minimum length enforced.
- **Honeypot Anti-Spam (`hp_field`):** Hidden bot trap. Submissions with `hp_field` populated are gracefully accepted (HTTP 201) to avoid bot adaptation, but flagged internally as `status='spam'`.
- **Sliding-Window IP Rate Limiter:** Enforces max 5 submissions per 5-minute sliding window per IP. Exceeding requests immediately return `HTTP 429 Too Many Requests`.
- **Endpoints:** `POST /api/v1/enquiries` (product-specific or general) and `POST /api/v1/contact`.

### 6.5 Automated Test Suite (`P3-06` & `P3-REV`)
- Ran `docker compose exec hardware-backend pytest -v`:
  - **37 passed, 0 failed (100% pass rate in 0.92s)**.
  - `tests/test_brands.py`: 5 tests (empty, seeded, detail, 404, unpublished brand security).
  - `tests/test_categories.py`: 6 tests (empty, root vs all with 4 roots, tree, detail with bathroom, 404, unpublished category security).
  - `tests/test_products.py`: 12 tests (pagination with 11 items, search, category hierarchy including bathroom/vanities, brand, stock, flags, sorting, detail, 404, unpublished product security, pricing policy zero cart endpoints).
  - `tests/test_enquiries.py`: 9 tests (valid enquiry, product enquiry, contact submission, honeypot spam detection, phone validation, message validation, rate limiter, anti-spoof X-Real-IP enforcement, public enquiry read prohibited).
  - `tests/test_health.py`: 2 tests (health check, root endpoint).
  - `tests/test_schemas.py`: 4 tests (enquiry, category, hybrid pricing).

---

## 7. Phase 3 Review Items Addressed

### Item 1: Bathroom Category Completeness
- **Database Schema & Seed:** Added `bathroom` as the 3rd root category with 6 child subcategories:
  1. `vanities` (Bathroom Vanities / باتھ روم وینٹیز)
  2. `commodes` (Commodes & Toilets / کموڈز اور ٹوائلٹس)
  3. `showers` (Shower Systems / شاور سسٹمز)
  4. `basins` (Wash Basins / واش بیسنز)
  5. `bathroom-faucets` (Bathroom Faucets & Mixers / باتھ روم ٹونٹیاں اور مکسرز)
  6. `bathroom-accessories` (Bathroom Accessories / باتھ روم اسیسریز)
- **Sample Products Seeded:**
  - `floating-vanity-with-led-mirror` (`vanities`, `bathroom`)
  - `rimless-wall-hung-smart-toilet` (`commodes`, `bathroom`)
  - `thermostatic-digital-piano-shower-system` (`showers`, `bathroom`)
- **Verification:** Verified `GET /api/v1/categories/bathroom` returns all 6 children and `product_count: 3`. Verified `GET /api/v1/products?category_slug=bathroom` returns all 3 bathroom products, and `GET /api/v1/products?category_slug=vanities` returns the vanity product.

### Item 2: Seed Data & Production Inventory Safeguard
- Added strict environment check in `seed_database`:
  ```python
  if getattr(settings, "APP_ENV", "") == "production" and not force_production:
      raise RuntimeError("Database seeding of sample development data is strictly disabled in production.")
  ```
- All seeded records are explicitly marked with `[Sample Development Record]` in their descriptions and logs.
- Fictional products, specifications, and brand relationships cannot be seeded or published automatically in production. Real production inventory will be authored through the authenticated Phase 4 Admin Dashboard.

### Item 3: Rate Limiter Architecture, Nginx IP Handling & Redis Roadmap
- **Current Architecture:** In-memory sliding-window rate limiter storing request timestamps per client IP (`dict[str, list[float]]`) with a threshold of 5 submissions per 5-minute sliding window.
- **Header Spoofing Prevention:** Hardened `_get_client_ip()` to prioritize `request.headers.get("x-real-ip")`. Nginx (`frontend/nginx.conf`) sets `proxy_set_header X-Real-IP $remote_addr;` authoritatively from the underlying TCP connection. Client-supplied `X-Forwarded-For` headers cannot override or spoof the rate limit key. Verified with automated test `test_rate_limiter_spoofed_header_prevention`.
- **Single-Instance Limitations & Redis Migration:** The in-memory limiter resets upon process restart and is isolated to a single Uvicorn process. In multi-worker or multi-container production deployments, Redis sorted sets (`ZADD`, `ZREMRANGEBYSCORE`, `ZCARD`) provide persistent, distributed rate limiting across all nodes.

### Item 4: Public API Security
- **Published-Only Constraint:** All public list and detail endpoints enforce `is_published.is_(True)`.
- **Unpublished Direct Request Rejection:** Direct slug requests to unpublished products (`/api/v1/products/{slug}`), categories (`/api/v1/categories/{slug}`), and brands (`/api/v1/brands/{slug}`) immediately return `HTTP 404 Not Found`. Verified via automated tests:
  - `test_unpublished_product_security`
  - `test_unpublished_category_security`
  - `test_unpublished_brand_security`
- **Private Enquiries & Admin Endpoints:** Public `GET /api/v1/enquiries` is prohibited (returns `405 Method Not Allowed`). Public `GET /api/v1/admin/*` is prohibited. Enquiries and admin records are accessible only to authenticated administrators.
- **Database & Secrets Protection:** Database connection credentials, JWT secrets, and internal stack traces are strictly hidden behind environment variables and sanitized exception handlers.

### Item 5: Pricing Policy & No E-Commerce
- **Price on Request Adherence:** Catalogue responses strictly conform to the Price on Request business model (`price_on_request: true`, `price: null` or explicit showroom estimate where confirmed).
- **Prohibited Modules:** Cart, checkout, user accounts, and payment gateways are completely absent. Verified via automated test `test_pricing_policy_no_cart_endpoints`. All conversion flows direct visitors to WhatsApp and phone contact channels.

---

## 8. Phase 4 Comprehensive Plan — Admin Dashboard, Authentication & Content Management

Phase 4 introduces the private, authenticated back-office administration panel for store operators.

### 8.1 Architecture & Stack
- **Frontend Admin Panel:** Modern React SPA served behind `/admin/` via Astro route or dedicated admin shell. Styled with the existing design system tokens (red/black/white palette, responsive layout, accessible inputs).
- **Backend Admin API:** FastAPI router mounted at `/api/v1/admin/` with strict role-based access control (RBAC).

### 8.2 Security, Authentication & Invitation Workflow (`P4-01`, `P4-02`)
1. **Zero Public Registration:** No public user signup.
2. **Bootstrap Super Admin:** CLI command `python -m app.cli create-admin --email ... --password ... --name ...` creates the first administrator.
3. **Invitation-Based Onboarding:**
   - Admin generates an invitation link from the dashboard: `POST /api/v1/admin/invitations` specifying email and role (`super_admin`, `admin`, `editor`).
   - Generates cryptographically secure, single-use token with 72-hour expiration saved in `admin_invitations` table.
   - Invited user accepts invitation via `POST /api/v1/admin/invitations/accept` with token and new password. Token is marked accepted.
4. **JWT Authentication & Token Lifecycle:**
   - `POST /api/v1/auth/login`: Accepts credentials, validates Argon2id hash, issues:
     - `access_token` (Short-lived: 15–30 minutes) in JSON response or secure cookie.
     - `refresh_token` (Longer-lived: 7 days) stored securely.
   - `POST /api/v1/auth/refresh`: Issues new access token upon presenting valid refresh token.
   - `POST /api/v1/auth/logout`: Revokes session.
5. **RBAC (Role-Based Access Control):**
   - `super_admin`: Full privileges including inviting users, managing roles, and triggering static site builds.
   - `admin`: Full catalogue and enquiry management (CRUD for products, categories, brands, variants, images).
   - `editor`: Content editing and translation management (products, categories, blog).

### 8.3 Catalogue Management CRUD (`P4-03`, `P4-04`)
1. **Categories Management (`/api/v1/admin/categories`):**
   - List, create, update, reorder (sort order), publish/unpublish, and delete categories.
   - Hierarchy tree editor (assign parent category).
2. **Brands Management (`/api/v1/admin/brands`):**
   - List, create, update, upload brand logo SVG/PNG, reorder, publish/unpublish.
3. **Products & Variants Management (`/api/v1/admin/products`):**
   - Full product CRUD with SKU, slugs, stock status (`in_stock`, `order_based`, `out_of_stock`), price and price-on-request toggles, featured/best-seller flags.
   - Category assignment (multi-category selector).
   - JSONB specifications editor (key-value specification builder).
   - Dynamic attribute values editor (Material, Finish, Thickness, Origin, Warranty).
   - Variants manager: add/edit variant SKUs, variant names, individual stock statuses.
4. **Media & Image Management (`P4-04`):**
   - `POST /api/v1/admin/media/upload`: Validates image formats (JPEG, PNG, WebP, SVG), file size limit (max 10MB), generates unique filenames, saves to `/data/media/` persistent volume.
   - Product gallery manager: upload multiple images, drag-and-drop sort order, set primary image, localized alt text.

### 8.4 Bilingual Content & Missing Translation Indicators (`P4-05`)
- Every form (products, categories, brands) presents side-by-side or tabbed English and Urdu editing fields:
  - Name (EN & UR)
  - Short Description (EN & UR)
  - Full Description (EN & UR)
  - Meta Title & Meta Description (EN & UR)
- **Visual Translation Status Indicators:**
  - Table columns and card badges display clear status tags:
    - 🟢 `Bilingual Complete` (Both English and Urdu present)
    - 🟡 `Urdu Missing` (English exists, Urdu empty)
    - 🔴 `Draft / Incomplete`
  - Filter by translation status to quickly find content needing Urdu translation.

### 8.5 Enquiry & Lead Inbox (`P4-06`)
- `GET /api/v1/admin/enquiries`: Paginated list of customer enquiries with filters by status (`new`, `in_progress`, `resolved`, `spam`), channel (`whatsapp`, `call`, `form`), and date range.
- `GET /api/v1/admin/enquiries/{id}`: Detailed enquiry view with linked product details, IP, and user agent.
- `PATCH /api/v1/admin/enquiries/{id}`: Update enquiry status and internal staff notes.

### 8.6 Static Site Rebuild Trigger (`P4-07`, `P4-08`)
- Admin dashboard button: "Publish Changes to Public Site".
- `POST /api/v1/admin/build/trigger`: Authenticated endpoint that triggers an Astro static build and tracks build status (`idle`, `building`, `success`, `failed`).

---

## 9. Phase 3 Completion Gate

Phase 3 is complete, conditionally approved, and all review items have been resolved and verified.
Awaiting user review and explicit approval of this report and the Phase 4 Plan before beginning Phase 4 implementation.


