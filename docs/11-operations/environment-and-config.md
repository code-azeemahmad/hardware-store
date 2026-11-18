# Environment and Configuration Policy

## Principles

- Configuration differs by local, test, staging, and production environment.
- Secrets are never committed to Git or embedded in frontend bundles.
- `.env.example` documents required variables with non-secret placeholders.
- Production secrets are injected through the host/deployment secret mechanism.
- Rotate credentials after suspected exposure and when staff access changes.

## Variable groups to define

| Group | Examples (names are illustrative) |
|---|---|
| App | `APP_ENV`, `LOG_LEVEL`, `PUBLIC_SITE_URL` |
| Database | `DATABASE_URL` or individual DB settings |
| Security | session/signing secret, allowed origins |
| Bootstrap | one-time admin bootstrap controls |
| Media | storage backend, path/bucket credentials |
| Email | SMTP/API provider configuration if selected |
| Build | authenticated build/deploy trigger secret |
| Observability | error monitoring and analytics settings if approved |

Document final names, defaults, validation, and which service consumes each variable during implementation.

## Prohibited

- Default production passwords.
- Secrets in `docker-compose.yml`.
- Secrets in `ARG`/`ENV` Docker build layers.
- Publicly exposed database credentials or admin bootstrap tokens.
- `PUBLIC_` frontend variables containing private credentials.
