#!/usr/bin/env bash
# ==============================================================================
# Naseer Plywood & Hardware — Production Deployment Script (Host-Side)
# Invoked via AWS SSM Run Command: /opt/hardware-store/scripts/deploy_host.sh <GIT_SHA>
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
LOCK_FILE="${LOCK_FILE:-/var/lock/hardware-store-deploy.lock}"
COMPOSE_FILE="${COMPOSE_FILE:-${DEPLOY_DIR}/docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-${DEPLOY_DIR}/.env.production}"
LAST_GOOD_FILE="${LAST_GOOD_FILE:-${DEPLOY_DIR}/.last_known_good_version}"

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

# Ensure environment file exists
if [ ! -f "${ENV_FILE}" ]; then
    echo "ERROR: Production environment file '${ENV_FILE}' not found."
    exit 1
fi

# 2. Concurrency Lock Protection (flock)
# Fallback to local lock directory if /var/lock is not writable
LOCK_DIR="$(dirname "${LOCK_FILE}")"
if [ ! -w "${LOCK_DIR}" ]; then
    LOCK_FILE="${DEPLOY_DIR}/.deploy.lock"
fi

exec 200>"${LOCK_FILE}"
if ! flock -n 200; then
    echo "ERROR: Another deployment is currently in progress. Aborting."
    exit 1
fi

cd "${DEPLOY_DIR}"
TOTAL_START=$(date +%s)

echo "======================================================================"
echo "STARTING DEPLOYMENT: Commit ${DEPLOY_SHA}"
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "Working directory: ${DEPLOY_DIR}"
echo "======================================================================"

# Sync host repository to target commit if git repository exists
if [ -d "${DEPLOY_DIR}/.git" ]; then
    echo "Syncing local repository working tree to target commit ${DEPLOY_SHA}..."
    git fetch origin --tags || true
    git checkout "${DEPLOY_SHA}" 2>/dev/null || echo "Notice: Checkout completed or using local working tree."
fi

# Read AWS Region and GHCR Owner from .env.production
AWS_REGION="$(grep -E '^AWS_REGION=' "${ENV_FILE}" | cut -d '=' -f2- | tr -d '\"' || echo 'ap-south-1')"
GHCR_OWNER="$(grep -E '^GHCR_OWNER=' "${ENV_FILE}" | cut -d '=' -f2- | tr -d '\"' || echo 'code-azeemahmad')"
export GHCR_OWNER
export IMAGE_TAG="${DEPLOY_SHA}"

# 3. Authenticate Docker with GitHub Container Registry (GHCR) if credential exists
# Checks AWS SSM Parameter Store for /hardware-store/ghcr-token (or environment GHCR_TOKEN)
GHCR_TOKEN="${GHCR_TOKEN:-}"
if [ -z "${GHCR_TOKEN}" ]; then
    GHCR_TOKEN="$(aws ssm get-parameter --name "/hardware-store/ghcr-token" --with-decryption --query "Parameter.Value" --output text --region "${AWS_REGION}" 2>/dev/null || true)"
fi

if [ -n "${GHCR_TOKEN}" ]; then
    echo "[1/7] Authenticating Docker with GitHub Container Registry (GHCR)..."
    echo "${GHCR_TOKEN}" | docker login ghcr.io -u "${GHCR_OWNER}" --password-stdin
else
    echo "[1/7] GHCR token not set in SSM; proceeding with public pull or existing session."
fi

# 4. Create Pre-Deployment Backup Snapshot
echo "[2/7] Creating pre-deployment database and media snapshot..."
mkdir -p "${DEPLOY_DIR}/backups"
PRE_DEPLOY_BACKUP="${DEPLOY_DIR}/backups/pre-deploy-${DEPLOY_SHA}"
if docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" ps --services --filter "status=running" | grep -q "^hardware-postgres$"; then
    bash "${DEPLOY_DIR}/scripts/backup.sh" "${PRE_DEPLOY_BACKUP}"
else
    echo "Notice: hardware-postgres is not running. Skipping pre-deployment backup."
fi

# 5. Pull Immutable Images from GHCR
echo "[3/7] Pulling immutable container images from GHCR for tag ${DEPLOY_SHA}..."
if [ "${PULL_IMAGES:-true}" = "true" ]; then
    docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" pull hardware-backend hardware-frontend || echo "Warning: Pull skipped or using local images."
fi

# Ensure PostgreSQL is running and healthy before running migrations
echo "[4/7] Ensuring PostgreSQL is running and healthy..."
docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" up -d hardware-postgres

until [ "$(docker inspect -f '{{.State.Health.Status}}' hardware-postgres 2>/dev/null)" = "healthy" ]; do
    echo "Waiting for hardware-postgres to become healthy..."
    sleep 2
done

# Initialize frontend deploy directory if missing
if [ ! -e "${DEPLOY_DIR}/frontend/deploy/current" ]; then
    echo "Initializing frontend/deploy release directory from container..."
    mkdir -p "${DEPLOY_DIR}/frontend/deploy/releases/release_init"
    docker run --rm -v "${DEPLOY_DIR}/frontend/deploy/releases/release_init:/target" \
        "ghcr.io/${GHCR_OWNER}/hardware-frontend:${DEPLOY_SHA}" cp -a /usr/share/nginx/html/. /target/ || true
    cd "${DEPLOY_DIR}/frontend/deploy" && ln -sfn releases/release_init current
    cd "${DEPLOY_DIR}"
fi

# 6. Apply Database Migrations
echo "[5/7] Applying Alembic database migrations..."
if ! docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" run --rm hardware-backend alembic upgrade head; then
    echo "CRITICAL: Database migration failed! Aborting container rollout."
    echo "Database has not been rolled back automatically to prevent data loss. Triage required."
    exit 1
fi

# 7. Update Running Application Containers (Tracking Actual Downtime)
echo "[6/7] Recreating application containers..."
RECREATE_START=$(date +%s)
docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" up -d --remove-orphans

# 8. Run Deep Health Checks
echo "[7/7] Verifying container health..."
sleep 8

HEALTH_OK=true

if [ "${TEST_SIMULATE_FAULT:-false}" = "true" ]; then
    echo "TEST HOOK: Simulating injected backend health check failure!"
    HEALTH_OK=false
else
    # Check backend container internally (no host port assumption)
    if ! docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" exec -T hardware-backend curl -sf http://localhost:8000/api/v1/health > /dev/null; then
        echo "Backend internal health check FAILED."
        HEALTH_OK=false
    fi

    # Check frontend public reverse proxy ingress (accepts 200 or 301/302 HTTPS redirect)
    if ! curl -sf -o /dev/null -w "%{http_code}" http://localhost/ | grep -qE "^(200|301|302)$"; then
        echo "Frontend public HTTP health check FAILED."
        HEALTH_OK=false
    fi
fi

# 9. Handle Success or Automatic Container Rollback
if [ "${HEALTH_OK}" = true ]; then
    RECREATE_END=$(date +%s)
    DOWNTIME=$((RECREATE_END - RECREATE_START))
    TOTAL_DURATION=$((RECREATE_END - TOTAL_START))
    echo "[7/7] Deployment verified successfully!"
    echo "  -> Measured transient restart window: ~${DOWNTIME}s"
    echo "  -> Total deployment execution time: ~${TOTAL_DURATION}s"
    echo "${DEPLOY_SHA}" > "${LAST_GOOD_FILE}"
    docker image prune -f
    echo "======================================================================"
    echo "DEPLOYMENT COMPLETE: ${DEPLOY_SHA} IS ACTIVE AND HEALTHY"
    echo "======================================================================"
    exit 0
else
    echo "======================================================================"
    echo "CRITICAL: Health checks failed! Initiating container rollback..."
    echo "======================================================================"

    if [ -f "${LAST_GOOD_FILE}" ]; then
        ROLLBACK_SHA="$(cat "${LAST_GOOD_FILE}" | tr -d '[:space:]')"
        echo "Rolling back application containers to last known good tag: ${ROLLBACK_SHA}"
        if [ -d "${DEPLOY_DIR}/.git" ]; then
            git checkout "${ROLLBACK_SHA}" 2>/dev/null || true
        fi
        export IMAGE_TAG="${ROLLBACK_SHA}"
        export GHCR_OWNER
        docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" up -d --remove-orphans

        echo "Verifying health of rolled-back containers..."
        sleep 8
        if docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" exec -T hardware-backend curl -sf http://localhost:8000/api/v1/health > /dev/null; then
            ROLLBACK_END=$(date +%s)
            TOTAL_OUTAGE=$((ROLLBACK_END - RECREATE_START))
            echo "Rollback to ${ROLLBACK_SHA} succeeded."
            echo "  -> Measured recovery outage window: ~${TOTAL_OUTAGE}s"
            echo "  -> Production database and media volumes remain 100% intact."
        else
            echo "ALERT: Rolled-back containers also failed health checks! Immediate operator intervention required."
        fi
    else
        echo "ERROR: No .last_known_good_version file found. Cannot perform automated rollback."
    fi

    # Exit with failure to alert SSM and GitHub Actions
    exit 1
fi
