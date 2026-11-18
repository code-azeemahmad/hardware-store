# Technology Stack

| Layer | Technology | Responsibility |
|---|---|---|
| Public frontend | Astro | Routing, templates, SSG, SEO-friendly HTML |
| Interactive UI | React Islands | Search autocomplete, gallery, menus, filters, carousel, admin interactions |
| Backend | FastAPI | REST API, validation, business logic, auth |
| ORM | SQLAlchemy 2.x | Database mapping and queries |
| Migrations | Alembic | Versioned schema changes |
| Database | PostgreSQL | Products, categories, users, enquiries, content |
| Reverse proxy | Nginx | Static serving, API proxy, headers, compression |
| Containers | Docker | Reproducible services |
| Orchestration | Docker Compose | Local/single-host service orchestration |
| Tests | Pytest plus frontend test tooling | Backend and frontend verification |

## Stack constraints

- Pin compatible dependency versions and commit lockfiles.
- Select and document the Astro/React integration and frontend package manager during scaffold.
- Use Pydantic schemas for API input/output.
- Use environment-based configuration.
- Use a supported password hashing library and authentication approach selected in the security design.
- Do not add Redis, Celery, a separate search engine, or a Node SSR runtime without measured need and an approved decision.

## Build and runtime distinction

Astro build tooling is needed during build, but the production frontend container may only need Nginx and generated static assets. Document the chosen multi-stage Docker build.
