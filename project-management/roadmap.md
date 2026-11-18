# Development Roadmap

## Phase 0 — Discovery and decisions
- Collect business profile, logo, domain, address, phone, hours.
- Inspect and catalog reference screenshots.
- Confirm inventory and category taxonomy.
- Confirm price display and enquiry form policy.
- Decide media storage, email provider, hosting, backup, and build trigger.
- Approve design tokens and Urdu slug strategy.

**Exit:** Open decisions required for initial scaffold are resolved.

## Phase 1 — Foundation and design system
- Create repository structure and coding standards.
- Scaffold Astro, React integration, FastAPI, PostgreSQL, Alembic.
- Configure Docker Compose and Nginx.
- Implement global tokens, typography, header, navigation, footer, responsive shell.
- Create reusable product/category components using clearly marked demo data.

**Exit:** Frontend and backend start reliably; design shell passes initial visual review.

## Phase 2 — Public page templates
- Homepage.
- Main category and subcategory templates.
- Product detail template.
- About, contact, brands, blog, search, and 404 templates.
- English and Urdu routes and RTL.
- Enquiry CTAs and forms.

**Exit:** All approved public page templates render with valid sample content in both languages.

## Phase 3 — Data and API
- Database models and migrations.
- Category hierarchy and product relationships.
- Brands, images, attributes, variants.
- Public catalogue API.
- Enquiry/contact endpoints.
- Validation, pagination, search/filter contracts.

**Exit:** API contracts and integration tests pass against PostgreSQL.

## Phase 4 — Admin dashboard
- Admin authentication and roles.
- Secure bootstrap and invitation onboarding.
- Product/category/brand management.
- Image uploads and media persistence.
- SEO/localized content editing.
- Enquiry management.
- Banners, blog, testimonials, settings.
- Build status and secure rebuild trigger.

**Exit:** Authorized staff can manage the catalogue end-to-end; access control tests pass.

## Phase 5 — Frontend/API integration and publishing
- Build-time catalogue retrieval.
- Static generation for published products/categories/locales.
- Dynamic search/filter behavior where required.
- Admin publishing and rebuild/deploy lifecycle.
- Failure reporting and rollback strategy.

**Exit:** Published content becomes available after successful build/deploy and unpublished content is not exposed.

## Phase 6 — SEO, accessibility, performance
- Metadata, canonical, hreflang, sitemap, robots.
- Breadcrumb and applicable structured data.
- Image optimization and performance checks.
- Accessibility and keyboard review.
- Urdu RTL review.
- Local SEO content with verified details.

**Exit:** SEO and quality audits meet agreed release criteria.

## Phase 7 — Production readiness and launch
- Production secrets and TLS.
- Database/media backups and restore test.
- Monitoring/logging.
- Security review and dependency scans.
- End-to-end and visual regression testing.
- Search Console and analytics setup if approved.
- Owner sign-off and deployment.

**Exit:** Production checklist is signed off and rollback/recovery are understood.

## Change control

Changes to scope, checkout, customer accounts, rendering architecture, services, or authentication require an approved decision record before implementation.
