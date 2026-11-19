# Hardware & Plywood Store Website

A bilingual (English/Urdu), SEO-oriented product-catalogue and business website for a hardware and plywood retailer in Pakistan.

## Project decisions

- **Website model:** Product catalogue; no online checkout or customer accounts.
- **Enquiries:** WhatsApp and telephone, with optional website enquiry/contact forms.
- **Admin:** Full-featured private dashboard; controlled, invitation-based administrator registration.
- **Frontend:** Astro SSG with React Islands for interactive components.
- **Backend:** FastAPI, SQLAlchemy 2.x, Alembic.
- **Database:** PostgreSQL.
- **Delivery:** Nginx + Docker Compose, with services named `hardware-frontend`, `hardware-backend`, and `hardware-postgres`.
- **Languages:** English (default) and Urdu (RTL), with `/ur/` URL namespace.
- **SEO:** Server/build-generated HTML, metadata, sitemap, canonical URLs, hreflang, structured data, and content SEO.

## Documentation map

- `AGENTS.md`, `GEMINI.md`, `CLAUDE.md`: coding-agent entry points.
- `docs/`: product, architecture, design, data, API, security, SEO, operations, and testing specifications.
- `project-management/`: roadmap, implementation plan, task register, progress, and change log.
- `.agents/rules/`: persistent agent rules.
- `.agents/workflows/`: repeatable agent procedures.

## Before implementation

1. Inspect the existing repository and preserve existing work.
2. Review all relevant screenshots in `reference/`. These are mandatory UI references.
3. Confirm placeholders in `docs/01-product/business-profile.md` and `docs/01-product/open-decisions.md`.
4. Finalize actual inventory, category taxonomy, translated content, business details, hosting, and media-storage choices.
5. Follow `project-management/roadmap.md` in phase order.

## Repository application structure

The intended application structure is documented in `docs/02-architecture/repository-structure.md`. Do not create application code merely by reading this documentation; implementation should follow the approved roadmap.

## Local development

### Quick Start with Docker Compose

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Build and launch all three containers:
   ```bash
   docker compose up --build -d
   ```
3. Check container status and health:
   ```bash
   docker compose ps
   ```
4. Access the services:
   - **Frontend (English):** [http://localhost/](http://localhost/)
   - **Frontend (Urdu RTL):** [http://localhost/ur/](http://localhost/ur/)
   - **Backend Health Check:** [http://localhost/api/v1/health](http://localhost/api/v1/health)
   - **Interactive API Docs:** [http://localhost/api/docs](http://localhost/api/docs)

5. Run database migrations:
   ```bash
   docker compose exec hardware-backend alembic upgrade head
   ```

6. Run automated test suite:
   ```bash
   docker compose exec hardware-backend pytest tests/
   ```

7. Stop containers:
   ```bash
   docker compose down
   ```

