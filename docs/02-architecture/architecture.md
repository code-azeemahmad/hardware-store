# System Architecture

## 1. Overview

The system consists of a statically generated public Astro website, a FastAPI application, and PostgreSQL. Nginx serves the generated website and reverse-proxies API requests.

```text
                         VISITOR / ADMIN
                               |
                         HTTPS :443
                               |
                     hardware-frontend
                      Nginx + Astro SSG
                         /          \
                static pages        /api/*
                    |                  |
                    |           hardware-backend
                    |              FastAPI
                    |                  |
                    |             SQLAlchemy
                    |                  |
                    +------------ hardware-postgres
                                      PostgreSQL
```

The diagram is logical: the frontend service contains Nginx and the built Astro output; the backend and database remain internal services.

## 2. Rendering and publishing

- Public pages use Astro Static Site Generation (SSG).
- At build time, Astro retrieves published catalogue/content data from FastAPI using a server-only build credential or an approved internal build process.
- Generated HTML is served by Nginx.
- React Islands enhance selected interactive controls.
- Admin UI is delivered as protected application UI; every admin API request is independently authenticated and authorized by FastAPI.
- When an admin publishes relevant content, a secure build/deploy trigger regenerates static pages. The trigger must be authenticated, rate-limited, and not expose deployment secrets to the browser.

### SSG trade-off

New or updated content does not automatically appear in generated public HTML until a rebuild/redeployment completes. The publishing workflow must show build status and failure state. Do not pretend content is live before deployment succeeds.

## 3. Service responsibilities

### hardware-frontend
- Nginx.
- Astro static output.
- Public static assets.
- Reverse proxy `/api/` to FastAPI.
- Security headers, compression, caching, and TLS termination at the chosen edge.

### hardware-backend
- FastAPI routes and business logic.
- Authentication and authorization.
- SQLAlchemy persistence.
- Pydantic request/response schemas.
- Enquiry validation and processing.
- Media upload coordination.
- Admin content management.
- Build trigger integration.

### hardware-postgres
- PostgreSQL database.
- Persistent data volume.
- Health checks.
- Backup and restore process.

## 4. Data flow

### Public catalogue request
1. Browser requests a static URL from Nginx.
2. Nginx returns pre-generated HTML and assets.
3. Optional React Islands hydrate for interactive behavior.
4. Search/filter requests may call public API endpoints if the feature requires dynamic results.

### Content publishing
1. Admin authenticates.
2. Admin changes content through protected API.
3. Backend validates and persists the change.
4. Backend records publication/build request.
5. Secure build pipeline fetches published content and builds Astro.
6. New output is deployed atomically or through a safe release swap.
7. Admin sees success/failure status.

### Enquiry
1. Visitor submits a validated form or clicks WhatsApp/telephone.
2. Backend validates, rate-limits, and stores form enquiries.
3. Admin views and updates enquiry status.
4. WhatsApp and telephone links use verified business contact details.

## 5. Security boundaries

- Public internet reaches Nginx only.
- Backend and PostgreSQL use a private Docker network.
- PostgreSQL has no public port mapping in production.
- Admin authorization is enforced in FastAPI, not merely hidden in frontend UI.
- Build credentials and database credentials are server-side only.
- Uploaded media is validated and stored persistently.

## 6. Scaling path

If future requirements demand frequently updated server-rendered pages, evaluate Astro SSR with a dedicated Node runtime as a separately approved architecture change. It would add a service/runtime and change deployment and caching behavior. Do not add it pre-emptively.
