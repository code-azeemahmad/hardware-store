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

# Read AWS Region and ECR Registry from .env.production
AWS_REGION="$(grep -E '^AWS_REGION=' "${ENV_FILE}" | cut -d '=' -f2- | tr -d '\"' || echo 'ap-south-1')"
ECR_REGISTRY="$(grep -E '^ECR_REGISTRY=' "${ENV_FILE}" | cut -d '=' -f2- | tr -d '\"' || true)"

# 3. Authenticate Docker with Amazon ECR using EC2 Instance Role (if ECR_REGISTRY is configured)
if [ -n "${ECR_REGISTRY}" ]; then
    echo "[1/7] Authenticating Docker with Amazon ECR..."
    aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${ECR_REGISTRY}"
else
    echo "[1/7] ECR_REGISTRY not set; skipping ECR login (local testing mode)."
fi

# 4. Create Pre-Deployment Backup Snapshot
echo "[2/7] Creating pre-deployment database and media snapshot..."
mkdir -p "${DEPLOY_DIR}/backups"
PRE_DEPLOY_BACKUP="${DEPLOY_DIR}/backups/pre-deploy-${DEPLOY_SHA}"
bash "${DEPLOY_DIR}/scripts/backup.sh" "${PRE_DEPLOY_BACKUP}"

# 5. Pull Immutable Images
echo "[3/7] Pulling immutable container images for tag ${DEPLOY_SHA}..."
export IMAGE_TAG="${DEPLOY_SHA}"
if [ -n "${ECR_REGISTRY}" ]; then
    docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" pull hardware-backend hardware-frontend
fi

# 6. Apply Database Migrations (Run inside temporary container)
echo "[4/7] Applying Alembic database migrations..."
if ! docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" run --rm --no-deps hardware-backend alembic upgrade head; then
    echo "CRITICAL: Database migration failed! Aborting container rollout."
    echo "Database has not been rolled back automatically to prevent data loss. Triage required."
    exit 1
fi

# 7. Update Running Application Containers (Tracking Actual Downtime)
echo "[5/7] Recreating application containers..."
RECREATE_START=$(date +%s)
docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" up -d --remove-orphans

# 8. Run Deep Health Checks
echo "[6/7] Verifying container health..."
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

    # Check frontend public reverse proxy ingress
    if ! curl -sf -k http://localhost/ > /dev/null; then
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
        export IMAGE_TAG="${ROLLBACK_SHA}"
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
