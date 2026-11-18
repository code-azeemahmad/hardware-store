# Architecture Rules

- Astro SSG is the initial public-site rendering strategy.
- React is limited to interactive islands; do not convert static content sections into React without a reason.
- FastAPI owns business logic, validation, authentication, and data access.
- PostgreSQL is the source of truth.
- Use SQLAlchemy 2.x and Alembic.
- Nginx is the public reverse proxy and static asset server.
- Preserve the three required service names: `hardware-frontend`, `hardware-backend`, `hardware-postgres`.
- Keep internal services on a private Docker network.
- Static product/category pages are generated from published catalogue data at build time.
- A content update must trigger a controlled frontend rebuild/redeployment or another explicitly approved publishing mechanism.
- Do not introduce SSR, Redis, a task queue, a CDN, or extra services without documenting need and approval.
