# Shared AI Agent Instructions

## Mission

Build and maintain a production-quality bilingual hardware and plywood product-catalogue website. Follow the requirements and architecture in `docs/`.

## Required reading

Before substantial work:
1. `docs/01-product/PRD.md`
2. `docs/01-product/requirements.md`
3. `docs/02-architecture/architecture.md`
4. `docs/02-architecture/tech-stack.md`
5. `docs/03-design/design-system.md`
6. Relevant domain documents (database, API, security, SEO, testing, deployment).
7. `project-management/roadmap.md` and the active task in `project-management/tasks.md`.

Before UI work, inspect every relevant asset in `reference/`. Reference screenshots are mandatory design inputs.

## Non-negotiable product rules

- Public visitors can browse without signing in.
- Do not implement cart checkout, online payment, or customer accounts unless an approved change is recorded.
- Product conversion is through WhatsApp and telephone enquiries; website enquiry forms may also be used.
- Admin functionality is private. Public self-service administrator registration is forbidden.
- Additional administrators can only be added through an authorized invitation/approval flow.
- English is the default language. Urdu lives under `/ur/` and uses correct RTL direction and suitable typography.
- Do not invent store details, product facts, prices, stock, brands, testimonials, reviews, certifications, or images.
- Use placeholders or clearly marked sample data until real business data is supplied.

## Architecture rules

- Astro is the primary public frontend and uses Static Site Generation (SSG) initially.
- Use React Islands only for genuinely interactive UI.
- FastAPI is the API and business-logic layer.
- PostgreSQL is the system of record.
- Use SQLAlchemy 2.x and Alembic migrations.
- Nginx is the only public application entry point in the three-service deployment.
- Keep the required Compose service/container names: `hardware-frontend`, `hardware-backend`, `hardware-postgres`.
- Do not expose PostgreSQL publicly.
- Do not add a Node SSR runtime or extra production service without an approved architecture decision.
- Product images belong in persistent file/object storage; PostgreSQL stores metadata and paths/URLs, not image binaries.

## Engineering rules

- Inspect existing code before changing it.
- Make small, cohesive changes and avoid unrelated refactors.
- Reuse existing components and patterns.
- Validate inputs on the server; never trust browser-side validation alone.
- Use typed request/response schemas and explicit error handling.
- Add or update tests for behavior changes.
- Run relevant formatting, linting, type checks, tests, migrations, and build checks before claiming completion.
- Never claim a test or command passed unless it was actually run and its result inspected.
- Do not commit secrets, real credentials, private customer data, or production database dumps.
- Use migrations for schema changes; do not silently modify production schema.
- Preserve backward compatibility where practical and document breaking changes.

## Documentation and workflow

- Follow `project-management/roadmap.md` and the approved active task.
- Update `project-management/tasks.md` and `progress.md` when work changes status.
- Update technical documentation when implementation changes architecture, API contracts, schema, security, or operations.
- Record significant trade-offs in `docs/02-architecture/decisions.md`.
- If requirements conflict or a decision is missing, stop and ask one focused question rather than inventing a requirement.
- Do not overwrite existing files without reviewing them and preserving relevant content.

## Definition of done

A task is complete only when its acceptance criteria are met, relevant tests/checks pass, accessibility and responsive behavior are considered, documentation is updated where needed, and remaining limitations are stated.
