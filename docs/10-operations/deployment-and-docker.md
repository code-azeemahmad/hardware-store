# Deployment and Docker Specification

## 1. Required services

| Compose service/container | Responsibility |
|---|---|
| `hardware-frontend` | Nginx serving Astro static output and proxying `/api/` |
| `hardware-backend` | FastAPI application |
| `hardware-postgres` | PostgreSQL |

Preserve these names unless an approved decision changes them.

## 2. Network and ports

- Public traffic enters through Nginx on HTTP/HTTPS.
- Backend listens on its internal container port.
- PostgreSQL listens on its internal container port only.
- Do not publish PostgreSQL to the public host in production.
- Backend should not be directly internet-accessible in production.

## 3. Volumes

- PostgreSQL data volume.
- Persistent media volume or approved object storage.
- Optional Nginx/ACME certificate volumes depending on TLS approach.

Container filesystems are ephemeral. Product images and database data must survive container replacement.

## 4. Health and startup

- Configure PostgreSQL health check.
- Backend waits for database health and performs bounded connection retries.
- Frontend depends on successful build artifacts and correct Nginx configuration.
- Health checks should verify service readiness, not merely process existence.

## 5. Configuration

Maintain `.env.example` with variable names and safe placeholder values. Keep real `.env` files out of version control.

Expected configuration categories:
- Database name/user/password/host.
- Backend environment and allowed origins.
- Admin bootstrap/invitation configuration.
- Media storage path/provider.
- Public site URL and API base path.
- Build trigger credentials.
- Email provider credentials, if email is enabled.
- Analytics/monitoring identifiers, if approved.

## 6. Build and release

- Use a multi-stage frontend build: Node build stage, Nginx runtime stage.
- Pin base image versions and dependencies.
- Build backend image reproducibly.
- Run migrations as a controlled release step, not concurrently from every app replica.
- Build Astro from published content using a secure server-side credential.
- Deploy generated assets atomically where possible.
- Keep previous release available for rollback.
- Never expose build/deploy secrets to browser code.

## 7. TLS and proxy

Choose the TLS termination location based on hosting architecture. Configure HTTPS redirects, trusted proxy headers, request-size limits, timeouts, compression, and security headers. Ensure FastAPI trusts forwarded headers only from the known proxy.

## 8. Backup and restore

- Back up PostgreSQL on a defined schedule.
- Back up media independently.
- Encrypt backups and restrict access.
- Define retention and off-host storage.
- Test restoration to a clean environment before launch and periodically thereafter.
- Document recovery point and recovery time objectives with the owner.
