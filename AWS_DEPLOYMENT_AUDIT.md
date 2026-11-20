# AWS Deployment Readiness & CI/CD Architecture Audit

**Project:** Naseer Plywood & Hardware  
**Target Environment:** AWS EC2 (Single-Host Production), Amazon ECR, AWS Systems Manager (SSM), GitHub Actions (OIDC)  
**Document Status:** Final Revision (Incorporating All Pre-Implementation Corrections)  

---

## 1. Executive Summary & Design Principles

This document specifies the revised AWS deployment architecture for Naseer Plywood & Hardware. It addresses critical production operational requirements:

1. **Zero Long-Lived Credentials:** Employs GitHub OIDC to assume an ephemeral, least-privilege IAM deployment role.
2. **Deterministic, Immutable Releases:** Every deployment and rollback references immutable Git commit SHA image tags in Amazon ECR; mutable `:latest` tags are never used for production state decisions.
3. **Internal-Only Health Verification:** Health checks accommodate container network boundaries: FastAPI backend (port 8000) and PostgreSQL (port 5432) are unexposed to the host network.
4. **Single-Instance Deployment Reality & Rollback:** In a single-instance EC2 architecture with Docker Compose, updating or rolling back containers inherently incurs a transient service interruption (typically 3 to 10 seconds) during container stop/start/healthcheck phases. A zero-downtime guarantee is not claimed. The rollback mechanism guarantees automated recovery to the previous verified commit SHA, verifies volume persistence, and records actual downtime.
5. **Decoupled Failure Domains:** Application container rollback is strictly separated from database restoration. A container failure triggers container rollback to the last known good commit SHA without wiping or overwriting production customer data.
6. **SSM Concurrency Protection:** Employs host-level file locking (`flock`) and GitHub Actions concurrency groups to prevent interleaved deployments.

---

## 2. Infrastructure, Container Topology & Network Isolation

### 2.1 Three-Service Topology
The application runs as three Docker containers on an isolated bridge network (`hardware-network`):

```
                        Internet
                           │
                   Ports 80 / 443 (TLS)
                           ▼
          ┌───────────────────────────────────┐
          │         hardware-frontend         │
          │   Nginx Alpine                    │
          │   - Host Port 80, 443 exposed     │
          │   - Serves static Astro releases  │
          │   - Proxies /api/ internally      │
          │   - Serves /media/ directly       │
          └─────────────────┬─────────────────┘
                            │ (hardware-network)
                            ▼
          ┌───────────────────────────────────┐
          │          hardware-backend         │
          │   FastAPI (Python 3.12 / Uvicorn) │
          │   - Port 8000 INTERNAL ONLY       │
          │   - Host port 8000 NOT published  │
          │   - Manages Astro SSG builds      │
          │   - Read/Write to /data/media     │
          └─────────────────┬─────────────────┘
                            │ (hardware-network)
                            ▼
          ┌───────────────────────────────────┐
          │         hardware-postgres         │
          │   PostgreSQL 17 Alpine            │
          │   - Port 5432 INTERNAL ONLY       │
          │   - Host port 5432 NOT published  │
          │   - Hardware postgres data volume │
          └───────────────────────────────────┘
```

### 2.2 Correct Health Check Strategy
**Port Isolation Policy:** `hardware-backend` exposes port `8000` to the Docker bridge network, but **not** to the EC2 host (`expose: ["8000"]`, no `ports: ["8000:8000"]`). Similarly, `hardware-postgres` exposes `5432` only to `hardware-network`. Running `curl http://localhost:8000/api/v1/health` on the EC2 host fails with `Connection refused`.

**Corrected Implementation:**
1. **Backend Health Check (Internal Container Network):**
   Execute the healthcheck inside the running container or via Docker Compose:
   ```bash
   docker compose --env-file /opt/hardware-store/.env.production -f docker-compose.prod.yml \
     exec -T hardware-backend curl -sf http://localhost:8000/api/v1/health > /dev/null
   ```
2. **Frontend & Proxy Ingress Health Check (Host Ingress):**
   Execute against the local Nginx ingress over HTTP/HTTPS:
   ```bash
   curl -sf -k http://localhost/ > /dev/null
   curl -sf -k http://localhost/api/v1/health > /dev/null
   ```

### 2.3 Astro Static Publishing & Shared Volume Preservation
- `hardware-backend` mounts `./frontend:/frontend` (rw).
- `hardware-frontend` mounts `./frontend/deploy:/usr/share/nginx/html:ro`.
- When an administrator triggers an SSG build in the Admin Dashboard, the backend compiles static pages into `/frontend/dist_staging`, validates them, creates a release directory `/frontend/deploy/releases/release_TIMESTAMP`, and swaps the `/frontend/deploy/current` symlink.
- **Rule:** The host directory `/opt/hardware-store/frontend/deploy` must remain intact across image pulls and deployments. `docker-compose.prod.yml` must continue mounting host `./frontend/deploy` so static releases survive container updates.

---

## 3. Environment Variable Handling & Compose Architecture

### 3.1 Compose Variable Interpolation vs. Container Runtime Env
To prevent configuration drift:
- **Compose Interpolation Variables:** Evaluated on the EC2 host when `docker compose` parses `docker-compose.prod.yml`. These variables (e.g. `${IMAGE_TAG}`, `${POSTGRES_USER}`, `${HTTP_PORT}`) are supplied by passing `--env-file /opt/hardware-store/.env.production`.
- **Container Environment Variables:** Injected into the container process table via the `environment:` stanza in `docker-compose.prod.yml`.
- **Command Rule:** Every Docker Compose command executed on the host must explicitly declare `--env-file /opt/hardware-store/.env.production` to ensure consistent resolution:
  ```bash
  docker compose --env-file /opt/hardware-store/.env.production -f docker-compose.prod.yml <COMMAND>
  ```

### 3.2 Server Bootstrap & Rollback Image Initialization
Before the first automated GitHub Actions deployment can run:
1. Directory structure created at `/opt/hardware-store` with owner `ubuntu:docker`.
2. Repository checked out at `/opt/hardware-store`.
3. Production configuration file `/opt/hardware-store/.env.production` provisioned (`chmod 600`) with high-entropy secrets generated by `scripts/generate_secrets.py`.
4. Host deployment script installed at `/opt/hardware-store/scripts/deploy_host.sh` with executable permissions (`chmod 755`).
5. Let's Encrypt certificates generated or dummy certificates placed in `certbot_certs` volume so Nginx can start.
6. **Rollback Image Initialization (No Placeholders):**
   - The initial baseline image must be built from a verified, passing Git commit SHA (`<INITIAL_COMMIT_SHA>`).
   - Confirm that both `${ECR_REGISTRY}/hardware-backend:<INITIAL_COMMIT_SHA>` and `${ECR_REGISTRY}/hardware-frontend:<INITIAL_COMMIT_SHA>` exist in Amazon ECR.
   - Record this verified commit SHA:
     ```bash
     echo "<INITIAL_COMMIT_SHA>" > /opt/hardware-store/.last_known_good_version
     ```
   - ECR Lifecycle Policy must be configured to retain at least 30 tagged versions, preventing accidental garbage collection of the last known good release.

---

## 4. Host-Side Deployment Script (`scripts/deploy_host.sh`)

GitHub Actions invokes a version-controlled, tested script residing on the EC2 host:

```bash
#!/usr/bin/env bash
# ==============================================================================
# Naseer Plywood & Hardware — EC2 Production Deployment Script
# Invoked via AWS SSM Run Command: /opt/hardware-store/scripts/deploy_host.sh <GIT_SHA>
# ==============================================================================

set -euo pipefail

DEPLOY_DIR="/opt/hardware-store"
LOCK_FILE="/var/lock/hardware-store-deploy.lock"
COMPOSE_FILE="${DEPLOY_DIR}/docker-compose.prod.yml"
ENV_FILE="${DEPLOY_DIR}/.env.production"
LAST_GOOD_FILE="${DEPLOY_DIR}/.last_known_good_version"

# 1. Input Validation
if [ "$#" -ne 1 ]; then
    echo "ERROR: Missing required commit SHA argument."
    echo "Usage: $0 <40-char-git-sha>"
    exit 1
fi

DEPLOY_SHA="$1"
if [[ ! "${DEPLOY_SHA}" =~ ^[0-9a-f]{40}$ ]]; then
    echo "ERROR: Invalid Git SHA '${DEPLOY_SHA}'. Must be a 40-character hexadecimal string."
    exit 1
fi

# 2. Concurrency Lock Protection (flock)
exec 200>"${LOCK_FILE}"
if ! flock -n 200; then
    echo "ERROR: Another deployment is currently in progress. Aborting."
    exit 1
fi

cd "${DEPLOY_DIR}"
START_TIME=$(date +%s)

echo "======================================================================"
echo "STARTING DEPLOYMENT: Commit ${DEPLOY_SHA}"
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "======================================================================"

# Read AWS Region and ECR Registry from .env.production
AWS_REGION="$(grep -E '^AWS_REGION=' "${ENV_FILE}" | cut -d '=' -f2- | tr -d '\"' || echo 'ap-south-1')"
ECR_REGISTRY="$(grep -E '^ECR_REGISTRY=' "${ENV_FILE}" | cut -d '=' -f2- | tr -d '\"')"

# 3. Authenticate Docker with Amazon ECR using EC2 Instance Role
echo "[1/7] Authenticating Docker with Amazon ECR..."
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${ECR_REGISTRY}"

# 4. Create Pre-Deployment Backup Snapshot
echo "[2/7] Creating pre-deployment database and media snapshot..."
mkdir -p "${DEPLOY_DIR}/backups"
PRE_DEPLOY_BACKUP="${DEPLOY_DIR}/backups/pre-deploy-${DEPLOY_SHA}"
bash "${DEPLOY_DIR}/scripts/backup.sh" "${PRE_DEPLOY_BACKUP}"

# 5. Pull Immutable Images
echo "[3/7] Pulling immutable container images for tag ${DEPLOY_SHA}..."
export IMAGE_TAG="${DEPLOY_SHA}"
docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" pull hardware-backend hardware-frontend

# 6. Apply Database Migrations (Run inside temporary container)
echo "[4/7] Applying Alembic database migrations..."
if ! docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" run --rm --no-deps hardware-backend alembic upgrade head; then
    echo "CRITICAL: Database migration failed! Aborting container rollout."
    echo "Database has not been rolled back automatically to prevent data loss. Triage required."
    exit 1
fi

# 7. Update Running Application Containers
echo "[5/7] Recreating application containers..."
RECREATE_START=$(date +%s)
docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" up -d --remove-orphans

# 8. Run Deep Health Checks
echo "[6/7] Verifying container health..."
sleep 10

HEALTH_OK=true

# Check backend container internally (no host port assumption)
if ! docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" exec -T hardware-backend curl -sf http://localhost:8000/api/v1/health > /dev/null; then
    echo "Backend internal health check FAILED."
    HEALTH_OK=false
fi

# Check frontend public reverse proxy ingress
if ! curl -sf -k http://localhost/ > /dev/null; then
    echo "Frontend public HTTP health check FAILED."
    HEALTH_OK=false
fi

# 9. Handle Success or Automatic Container Rollback
if [ "${HEALTH_OK}" = true ]; then
    RECREATE_END=$(date +%s)
    DOWNTIME=$((RECREATE_END - RECREATE_START))
    echo "[7/7] Deployment verified successfully! Transient restart window: ~${DOWNTIME}s."
    echo "${DEPLOY_SHA}" > "${LAST_GOOD_FILE}"
    docker image prune -f
    echo "======================================================================"
    echo "DEPLOYMENT COMPLETE: ${DEPLOY_SHA}"
    echo "======================================================================"
    exit 0
else
    echo "======================================================================"
    echo "CRITICAL: Health checks failed! Initiating container rollback..."
    echo "======================================================================"

    if [ -f "${LAST_GOOD_FILE}" ]; then
        ROLLBACK_SHA="$(cat "${LAST_GOOD_FILE}")"
        echo "Rolling back application containers to last known good tag: ${ROLLBACK_SHA}"
        export IMAGE_TAG="${ROLLBACK_SHA}"
        docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" up -d --remove-orphans

        echo "Verifying health of rolled-back containers..."
        sleep 8
        if docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" exec -T hardware-backend curl -sf http://localhost:8000/api/v1/health > /dev/null; then
            ROLLBACK_END=$(date +%s)
            TOTAL_OUTAGE=$((ROLLBACK_END - RECREATE_START))
            echo "Rollback to ${ROLLBACK_SHA} succeeded. Total recovery outage: ~${TOTAL_OUTAGE}s."
        else
            echo "ALERT: Rolled-back containers also failed health checks! Immediate operator intervention required."
        fi
    else
        echo "ERROR: No .last_known_good_version file found. Cannot perform automated rollback."
    fi

    # Exit with failure to alert GitHub Actions
    exit 1
fi
```

---

## 5. Database Migration & Rollback Safety

### 5.1 Backward-Compatible Migration Pattern (Expand / Contract)
To enable safe container rollbacks without database corruption, all database changes must follow the **Expand / Contract** pattern:

1. **Step 1 (Expand):**
   - Add new columns as `NULL` or with database-level `DEFAULT` values.
   - Add new tables.
   - Do **not** drop existing columns, rename columns, or add restrictive `NOT NULL` constraints without defaults.
   - *Result:* Both the previous container version (`N-1`) and the new container version (`N`) can execute against the schema concurrently.
2. **Step 2 (Deploy Code):**
   - Roll out new backend image that reads and writes the new schema.
   - If health checks fail and the container rolls back to `N-1`, `N-1` continues functioning because old columns and tables remain intact.
3. **Step 3 (Contract — Subsequent Release):**
   - In a later release after `N` has proven stable, remove deprecated columns and old tables in a cleanup migration.

### 5.2 Separation of Container Rollback vs. Database Restoration
- **Automatic Container Rollback:** Automated during deployment. If the new container image fails health checks (e.g. crash loop, bad Python import, missing env var), the script rolls back containers to `${ROLLBACK_SHA}`.
- **Database Restoration is Strictly Manual:** The deployment script will **never** automatically restore the database dump. Automatically rolling back the database risks wiping live customer inquiries, staff registrations, and catalog modifications made during or immediately prior to the deployment window.

### 5.3 Manual Disaster Recovery Procedure for Failed Migrations
If an invalid migration was applied and broke database operation:
1. Inspect Alembic state inside the backend container:
   ```bash
   docker compose --env-file .env.production -f docker-compose.prod.yml exec hardware-backend alembic current
   ```
2. If the migration can be safely reverted via Alembic:
   ```bash
   docker compose --env-file .env.production -f docker-compose.prod.yml exec hardware-backend alembic downgrade -1
   ```
3. In the event of catastrophic data corruption, restore from the pre-deployment snapshot:
   ```bash
   bash scripts/restore.sh backups/pre-deploy-<SHA> hardware_db
   ```

---

## 6. GitHub Actions Hardening Specification

### 6.1 Workflow Pinning & Concurrency Protection
The CI/CD pipeline in `.github/workflows/deploy.yml` must implement:
- **Dependency Locking:** Use `npm ci` (never `npm install`) with `frontend/package-lock.json`.
- **Action Pinning:** Pin all third-party GitHub Actions to reviewed full commit SHAs:
  - `actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11` (v4.1.1)
  - `actions/setup-python@0a5c61591373683505ea898e09a6ea86e8b16631` (v5.0.0)
  - `actions/setup-node@60edb5dd545a775178f525247059d640211939f1` (v4.0.2)
  - `aws-actions/configure-aws-credentials@e3ddf4a3c9e70bc52b4fa0e45cb0dc2c8c4b574e` (v4.0.2)
  - `aws-actions/amazon-ecr-login@062b18b96a7aff071d4dc91bc00c4c1a7945b076` (v2.0.1)
- **Deployment Concurrency Lock:**
  ```yaml
  concurrency:
    group: production-deployment
    cancel-in-progress: false
  ```
  Ensures that pushes to `main` are processed sequentially and cannot interleave SSM commands on the server.

### 6.2 Validated GitHub Actions Workflow (`.github/workflows/deploy.yml`)

```yaml
name: Production CI/CD Pipeline

on:
  push:
    branches:
      - main

permissions:
  id-token: write
  contents: read

concurrency:
  group: production-deployment
  cancel-in-progress: false

env:
  AWS_REGION: ap-south-1
  ECR_REGISTRY: ${{ vars.AWS_ACCOUNT_ID }}.dkr.ecr.ap-south-1.amazonaws.com
  EC2_INSTANCE_ID: ${{ vars.PROD_EC2_INSTANCE_ID }}
  ROLE_TO_ASSUME: arn:aws:iam::${{ vars.AWS_ACCOUNT_ID }}:role/GitHubActions-HardwareStore-Deploy

jobs:
  test-and-verify:
    name: Run Automated Tests & Static Checks
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11

      - name: Set up Python 3.12
        uses: actions/setup-python@0a5c61591373683505ea898e09a6ea86e8b16631
        with:
          python-version: "3.12"
          cache: "pip"

      - name: Run Backend Tests
        run: |
          pip install -r backend/requirements.txt
          pytest backend/tests/

      - name: Set up Node.js 22
        uses: actions/setup-node@60edb5dd545a775178f525247059d640211939f1
        with:
          node-version: "22"
          cache: "npm"
          cache-dependency-path: frontend/package-lock.json

      - name: Run Frontend Type & Static Checks
        run: |
          npm --prefix frontend ci
          npm --prefix frontend run check

  build-and-deploy:
    name: Build ECR Images & Deploy via SSM
    needs: test-and-verify
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11

      - name: Authenticate to AWS via OIDC
        uses: aws-actions/configure-aws-credentials@e3ddf4a3c9e70bc52b4fa0e45cb0dc2c8c4b574e
        with:
          role-to-assume: ${{ env.ROLE_TO_ASSUME }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Log in to Amazon ECR
        uses: aws-actions/amazon-ecr-login@062b18b96a7aff071d4dc91bc00c4c1a7945b076

      - name: Build and Push Backend Image
        run: |
          docker build \
            --file backend/Dockerfile \
            --tag ${{ env.ECR_REGISTRY }}/hardware-backend:${{ github.sha }} \
            ./backend
          docker push ${{ env.ECR_REGISTRY }}/hardware-backend:${{ github.sha }}

      - name: Build and Push Frontend Image
        run: |
          docker build \
            --file frontend/Dockerfile \
            --build-arg PUBLIC_SITE_URL=https://naseerhardware.pk \
            --tag ${{ env.ECR_REGISTRY }}/hardware-frontend:${{ github.sha }} \
            ./frontend
          docker push ${{ env.ECR_REGISTRY }}/hardware-frontend:${{ github.sha }}

      - name: Trigger SSM Deployment Command
        id: ssm_trigger
        run: |
          COMMAND_ID=$(aws ssm send-command \
            --instance-ids "${{ env.EC2_INSTANCE_ID }}" \
            --document-name "AWS-RunShellScript" \
            --comment "Deploy commit ${{ github.sha }}" \
            --parameters 'commands=["/opt/hardware-store/scripts/deploy_host.sh ${{ github.sha }}"]' \
            --query "Command.CommandId" \
            --output text)
          
          echo "command_id=${COMMAND_ID}" >> $GITHUB_OUTPUT
          echo "Dispatched SSM Command ID: ${COMMAND_ID}"

      - name: Poll Deployment Status & Enforce Completion
        run: |
          COMMAND_ID="${{ steps.ssm_trigger.outputs.command_id }}"
          echo "Awaiting execution of SSM command: ${COMMAND_ID}..."
          
          aws ssm wait command-executed \
            --command-id "${COMMAND_ID}" \
            --instance-id "${{ env.EC2_INSTANCE_ID }}"
          
          STATUS=$(aws ssm get-command-invocation \
            --command-id "${COMMAND_ID}" \
            --instance-id "${{ env.EC2_INSTANCE_ID }}" \
            --query "Status" \
            --output text)
          
          echo "SSM Command Execution Status: ${STATUS}"
          
          if [ "${STATUS}" != "Success" ]; then
            echo "=========================================================="
            echo "DEPLOYMENT FAILED! Output logs:"
            echo "=========================================================="
            aws ssm get-command-invocation \
              --command-id "${COMMAND_ID}" \
              --instance-id "${{ env.EC2_INSTANCE_ID }}" \
              --query "StandardErrorContent" \
              --output text
            exit 1
          fi
          
          echo "Deployment succeeded."
```

---

## 7. Backup, Disaster Recovery & Production Verification

### 7.1 Encrypted Off-Instance Backup Strategy
While `scripts/backup.sh` reliably produces local archives at `/opt/hardware-store/backups/`, local storage is vulnerable to EBS volume failure or instance termination.
- **Off-Instance Target:** Amazon S3 bucket `s3://naseer-hardware-backups/` with:
  - Default KMS encryption (`aws:kms`).
  - S3 Object Versioning enabled.
  - S3 Lifecycle policy transitioning archives to S3 Glacier Flexible Retrieval after 30 days and expiration after 365 days.
- **Scheduled Sync (Cron on EC2):**
  ```bash
  # /etc/cron.d/hardware-store-backup
  0 3 * * * ubuntu /opt/hardware-store/scripts/backup.sh && aws s3 sync /opt/hardware-store/backups/ s3://naseer-hardware-backups/ --sse aws:kms
  ```

### 7.2 Restore Verification Drill
To guarantee restore procedures work when required:
- Run a quarterly verification drill on a separate staging environment:
  1. Fetch the latest `database.dump` and `media.tar.gz`.
  2. Validate checksums against `SHA256SUMS`.
  3. Execute `scripts/restore.sh` into a standalone PostgreSQL test container.
  4. Verify record counts against `manifest.json`.

### 7.3 Production Environment Verification Matrix

| Verification Check | Target Endpoint / Command | Execution Context | Success Criteria |
| :--- | :--- | :--- | :--- |
| **DNS Resolution** | `dig +short naseerhardware.pk` | External / Host | Resolves to EC2 Elastic IP |
| **HTTP -> HTTPS 301** | `curl -sI http://naseerhardware.pk/` | External | `HTTP/1.1 301 Moved Permanently`<br>`Location: https://naseerhardware.pk/` |
| **Apex Canonicalization** | `curl -sI https://www.naseerhardware.pk/` | External | `HTTP/2 301`<br>`Location: https://naseerhardware.pk/` |
| **TLS Certificate** | `openssl s_client -connect naseerhardware.pk:443 -servername naseerhardware.pk` | External | Valid certificate issued by Let's Encrypt |
| **Public Ingress Health** | `curl -sf https://naseerhardware.pk/api/v1/health` | External | `{"status":"ok","database":"connected",...}` |
| **Internal Backend Health** | `docker compose exec hardware-backend curl -sf http://localhost:8000/api/v1/health` | EC2 Internal | `HTTP 200 OK` (Port 8000 unexposed) |
| **Media Delivery & Headers** | `curl -sI https://naseerhardware.pk/media/sample.webp` | External | `HTTP/2 200`<br>`Content-Type: image/webp`<br>`X-Content-Type-Options: nosniff` |
| **Volume Persistence** | Recreate containers via `docker compose up -d` | EC2 Host | Database rows and media files remain 100% intact |
| **Static SSG Rebuild** | `POST /api/v1/admin/build/trigger` | Admin UI | Build succeeds, `current` symlink swaps atomically |

### 7.4 IAM Permission Review & Least-Privilege Policies

#### A. GitHub Actions OIDC Trust Relationship (Trust Policy)
Attached to role `arn:aws:iam::<ACCOUNT_ID>:role/GitHubActions-HardwareStore-Deploy`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:code-azeemahmad/hardware-store:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

#### B. GitHub Actions Deployment IAM Policy (Permissions Policy)
Attached to role `arn:aws:iam::279171431825:role/GitHubActions-HardwareStore-Deploy`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "SSMSendDeploymentCommand",
      "Effect": "Allow",
      "Action": "ssm:SendCommand",
      "Resource": [
        "arn:aws:ec2:ap-south-1:279171431825:instance/i-0886cfd21fc2cc3cb",
        "arn:aws:ssm:ap-south-1::document/AWS-RunShellScript"
      ]
    },
    {
      "Sid": "SSMPollCommandInvocation",
      "Effect": "Allow",
      "Action": "ssm:GetCommandInvocation",
      "Resource": "*"
    }
  ]
}
```
*(Note: Because container images are built and stored in GitHub Container Registry via `GITHUB_TOKEN`, no ECR permissions are required for the GitHub Actions deployment role).*

#### C. EC2 Instance Profile IAM Policy
Attached to role `arn:aws:iam::279171431825:role/NaseerHardwareEC2ProductionRole`:
- Managed Policy: `AmazonSSMManagedInstanceCore`
- Custom Permissions Policy for S3 Backups & optional private GHCR token in SSM:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "SSMParamStoreGHCRToken",
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters"
      ],
      "Resource": "arn:aws:ssm:ap-south-1:279171431825:parameter/hardware-store/ghcr-token"
    },
    {
      "Sid": "EncryptedBackupSync",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::naseer-hardware-backups",
        "arn:aws:s3:::naseer-hardware-backups/*"
      ]
    }
  ]
}
```
*Note: The AWS managed policy `AmazonSSMManagedInstanceCore` is also attached to the EC2 instance role to enable SSM agent connectivity.*

---

## 8. Local vs. AWS Environment Testing Boundaries

- **Can Be Completed & Verified Locally:**
  - Pytest suite (105 tests).
  - Frontend type check (`npm run check`) and build (`npm run build`).
  - Pillow image optimization, EXIF stripping, and WebP compression logic.
  - Reference-counted physical media cleanup logic.
  - Docker Compose volume persistence test across `docker compose up -d`.
  - Nginx static and media serving configuration.
- **Requires Live AWS Environment:**
  - Route 53 DNS propagation to EC2 Elastic IP.
  - Let's Encrypt live ACME TLS certificate issuance (requires public port 80 accessibility).
  - GitHub Actions OIDC STS token exchange with AWS IAM.
  - Amazon ECR push and pull authentication using IAM instance profile.
  - AWS SSM Run Command end-to-end execution.
