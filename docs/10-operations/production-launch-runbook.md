# Naseer Plywood & Hardware — Production Launch Runbook & Operational Procedures

This document provides the definitive, step-by-step production launch runbook, operational procedures, security hardening specifications, and disaster recovery procedures for **`https://naseerhardware.pk`**.

---

## 1. Production Architecture Overview

The production deployment follows a strict 3-tier containerized architecture orchestrated via Docker Compose:

```
                      INTERNET (Public Visitors & Admins)
                                       │
                                       ▼ (Ports 80 & 443)
              ┌───────────────────────────────────────────────────┐
              │           hardware-frontend (Nginx Alpine)        │
              │  - TLS 1.2/1.3 Termination (Let's Encrypt)        │
              │  - HSTS & Hardened Security Headers               │
              │  - Astro SSG Static Files (Atomic Releases)       │
              │  - Gzip Compression & Static Asset Caching        │
              │  - Native 301 Permanent Subcategory Redirects     │
              └───────────────┬───────────────────┬───────────────┘
                              │                   │
         /_astro/ & static    │                   │  /api/ (Reverse Proxy)
                              ▼                   ▼
                     Static Deployment    ┌───────────────────────────────┐
                     Volume (Read-Only)   │  hardware-backend (FastAPI)   │
                                          │  - Python 3.12 + Node.js 20   │
                                          │  - RBAC & JWT Session Auth    │
                                          │  - Enquiry Rate Limiting      │
                                          │  - SSG Background Builder     │
                                          └───────────────┬───────────────┘
                                                          │
                                                          │ Private Docker Network
                                                          ▼ (Port 5432 - Internal Only)
                                          ┌───────────────────────────────┐
                                          │  hardware-postgres (Postgres) │
                                          │  - PostgreSQL 17 Alpine       │
                                          │  - System of Record           │
                                          │  - NO PUBLIC HOST EXPOSURE    │
                                          └───────────────────────────────┘
```

---

## 2. Pre-Launch Verification Checklist

Prior to launching production traffic:

- [x] **Zero Online Payments:** Cart/checkout modules are strictly prohibited and absent.
- [x] **Price on Request Policy:** All products enforce `price = NULL` and `price_on_request = TRUE`.
- [x] **Truth in Content:** All unverified claims (0.3s biometric recognition, certified marine plywood, 10-year/lifetime guarantees) have been removed or replaced with store-verified policies.
- [x] **DS-681 Unbranded:** Häfele brand and German origin dissociated from DS-681; SKU set to store-verified `NP-LK-DS681`.
- [x] **Accessibility WCAG AA:** Darkened WhatsApp green `#0d6e38` achieves 6.95:1 contrast against white; axe-core reports 0 violations across bilingual pages.
- [x] **Mobile Core Web Vitals:** Mobile LCP optimized to 2.70s (EN) and 2.78s (UR) via HTML `<head>` preloading; Desktop LCP is 0.58s; TBT is 0ms.
- [x] **SEO & Bilingual Sitemap:** Canonical URLs, reciprocal hreflang (`en`, `ur`, `x-default`), dynamic `sitemap.xml` with 78 valid URLs, and crawl-budget protection in `robots.txt`.
- [x] **Automated Tests:** 100/100 pytest suite passing; frontend TypeScript & Astro check reports 0 errors across 138 files.
- [x] **E2E Smoke Tests:** Public flow, enquiry submission, Urdu RTL, real-time search, and admin rebuild flows all verified passing.

---

## 3. Production Deployment Step-by-Step

### Step 3.1: Generate High-Entropy Cryptographic Secrets
Run the secrets generator to produce production credentials:
```bash
python3 scripts/generate_secrets.py --env-file .env.production
```
Verify permissions:
```bash
chmod 600 .env.production
```

### Step 3.2: Configure DNS Records
Ensure your domain registrar / DNS provider has active A records:
- `naseerhardware.pk` -> `[PRODUCTION_HOST_IP]`
- `www.naseerhardware.pk` -> `[PRODUCTION_HOST_IP]`

### Step 3.3: Obtain Let's Encrypt TLS Certificate
For initial certificate generation on a clean server:
```bash
docker run --rm -p 80:80 \
  -v hardware_certbot_certs:/etc/letsencrypt \
  -v hardware_certbot_webroot:/var/www/certbot \
  certbot/certbot certonly --standalone \
  -d naseerhardware.pk -d www.naseerhardware.pk \
  --email admin@naseerhardware.com --agree-tos --non-interactive
```

### Step 3.4: Launch Production Docker Compose Stack
Launch the services using the production Compose configuration:
```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

### Step 3.5: Apply Database Migrations & Bootstrap Super Admin
Ensure database schema is upgraded to HEAD:
```bash
docker compose -f docker-compose.prod.yml exec hardware-backend alembic upgrade head
```

Bootstrap the initial super-admin account using the generated password:
```bash
docker compose -f docker-compose.prod.yml exec hardware-backend python -m app.cli create-admin \
  --email admin@naseerhardware.com \
  --password "$ADMIN_INITIAL_PASSWORD" \
  --name "Owner / Super Admin" \
  --role super_admin
```

### Step 3.6: Trigger Initial Static Site Build
Generate the production website directly from the live database:
```bash
# Login to obtain admin token
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@naseerhardware.com", "password": "'"$ADMIN_INITIAL_PASSWORD"'"}' | jq -r .access_token)

# Trigger publishing build
curl -s -X POST http://localhost:8000/api/v1/admin/build/trigger \
  -H "Authorization: Bearer $TOKEN"
```
The build engine compiles all English and Urdu routes in ~2.8 seconds and atomically links the active release.

---

## 4. Post-Launch Verification

Execute the following verification checks against the live domain:

### 4.1 HTTPS & Security Headers Audit
```bash
curl -I https://naseerhardware.pk/
```
**Expected Response Headers:**
- `HTTP/2 200`
- `strict-transport-security: max-age=63072000; includeSubDomains; preload`
- `x-content-type-options: nosniff`
- `x-frame-options: SAMEORIGIN`
- `referrer-policy: strict-origin-when-cross-origin`
- `content-security-policy: default-src 'self' ...`

### 4.2 HTTP to HTTPS 301 Redirect Check
```bash
curl -I http://naseerhardware.pk/
# Expected: HTTP/1.1 301 Moved Permanently -> Location: https://naseerhardware.pk/
```

### 4.3 Backend Health Check
```bash
curl -s https://naseerhardware.pk/api/v1/health | jq .
# Expected: {"status": "ok", "database": "connected", "app_env": "production", "version": "1.0.0"}
```

### 4.4 Run End-to-End Smoke Test Suite
```bash
BASE_URL="https://naseerhardware.pk" node tests/e2e/e2e_smoke_test.js
```

---

## 5. Day-2 Maintenance & Monitoring Runbook

### 5.1 Automated Daily Backups
Add a crontab entry on the host machine to execute nightly snapshots at 02:00 PKT:
```bash
# Edit host crontab: crontab -e
0 21 * * * /home/pc/projects/hardware-store/scripts/backup.sh /var/backups/hardware-store/backup_$(date +\%Y\%m\%d_\%H\%M\%S) >> /var/log/hardware_backup.log 2>&1
```

### 5.2 Automated Let's Encrypt SSL Certificate Renewal
Add a bi-weekly crontab entry for certificate renewal:
```bash
0 3 1,15 * * docker run --rm -v hardware_certbot_certs:/etc/letsencrypt -v hardware_certbot_webroot:/var/www/certbot certbot/certbot renew --webroot -w /var/www/certbot --quiet && docker compose -f /home/pc/projects/hardware-store/docker-compose.prod.yml exec hardware-frontend nginx -s reload
```

### 5.3 Health & Container Inspection
```bash
# View service status and health checks
docker compose -f docker-compose.prod.yml ps

# View live container logs
docker compose -f docker-compose.prod.yml logs -f --tail=100
```

### 5.4 Rollback Procedure
If a static build deployment encounters an issue or unwanted content is published:
```bash
# Call admin rollback endpoint (reverts symlink to previous release in <10ms)
curl -X POST https://naseerhardware.pk/api/v1/admin/build/rollback \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```
Or manually switch the symlink on the host:
```bash
cd frontend/deploy
ln -sfn releases/[PREVIOUS_RELEASE_ID] current
```
The active release immediately points back to the prior known-good build with zero visitor disruption.
