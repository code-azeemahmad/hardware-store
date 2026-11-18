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

## Phase 3 — API and database
- [ ] P3-01 Categories and products schema.
- [ ] P3-02 Brands, images, attributes, variants schema.
- [ ] P3-03 Public category/product endpoints.
- [ ] P3-04 Search/filter/pagination.
- [ ] P3-05 Enquiry/contact endpoints and abuse controls.
- [ ] P3-06 Automated database tests and migrations.

## Phase 4 — Admin
- [ ] P4-01 Secure admin bootstrap and login.
- [ ] P4-02 Roles, permissions, invitation workflow.
- [ ] P4-03 Product/category/brand CRUD.
- [ ] P4-04 Media upload and persistence.
- [ ] P4-05 Localized content and SEO editing.
- [ ] P4-06 Enquiry management.
- [ ] P4-07 Banners/blog/testimonials/settings.
- [ ] P4-08 Audit log and build status.

## Phase 5 — Publishing integration
- [ ] P5-01 Astro build-time API integration.
- [ ] P5-02 Generate product/category pages for both locales.
- [ ] P5-03 Secure rebuild trigger.
- [ ] P5-04 Publish/unpublish and failed-build behavior.

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
