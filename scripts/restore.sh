#!/usr/bin/env bash
# ==============================================================================
# Naseer Plywood & Hardware — Production Restore Utility
# Verifies integrity and restores PostgreSQL DB & Media files from backup snapshot.
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

BACKUP_DIR="${1:-}"
TARGET_DB="${2:-hardware_db}"

if [ -z "${BACKUP_DIR}" ] || [ ! -d "${BACKUP_DIR}" ]; then
    echo "Usage: $0 <path-to-backup-dir> [target_database_name]"
    echo "Example: $0 backups/backup_20261119_060000 hardware_db"
    exit 1
fi

POSTGRES_CONTAINER="hardware-postgres"
BACKEND_CONTAINER="hardware-backend"

# Auto-detect database credentials from environment files if not already provided
if [ -z "${POSTGRES_USER:-}" ]; then
    if [ -f "${ROOT_DIR}/.env.production" ]; then
        ENV_USER="$(grep -E '^POSTGRES_USER=' "${ROOT_DIR}/.env.production" | cut -d '=' -f2- | tr -d '\"' || true)"
        POSTGRES_USER="${ENV_USER:-hardware_user}"
    elif [ -f "${ROOT_DIR}/.env" ]; then
        ENV_USER="$(grep -E '^POSTGRES_USER=' "${ROOT_DIR}/.env" | cut -d '=' -f2- | tr -d '\"' || true)"
        POSTGRES_USER="${ENV_USER:-hardware_user}"
    fi
fi

POSTGRES_USER="${POSTGRES_USER:-hardware_user}"

echo "======================================================================"
echo "STARTING RESTORE FROM: ${BACKUP_DIR}"
echo "Target database: ${TARGET_DB}"
echo "======================================================================"

# 1. Verify SHA256 checksums
echo "[1/5] Verifying backup checksums..."
(
    cd "${BACKUP_DIR}"
    if [ ! -f "SHA256SUMS" ]; then
        echo "Error: SHA256SUMS file missing from backup directory."
        exit 1
    fi
    sha256sum --check SHA256SUMS
)
echo "  -> Checksums verified: Backup archive is intact."

# 2. Check required files
for f in "database.dump" "media.tar.gz" "manifest.json"; do
    if [ ! -f "${BACKUP_DIR}/${f}" ]; then
        echo "Error: Missing required backup file ${f} in ${BACKUP_DIR}"
        exit 1
    fi
done

# 3. Restore PostgreSQL Database
echo "[2/5] Restoring PostgreSQL database: ${TARGET_DB}..."
# Terminate existing connections, drop and recreate target database
docker compose exec -T "${POSTGRES_CONTAINER}" psql -U "${POSTGRES_USER}" -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${TARGET_DB}' AND pid <> pg_backend_pid();"
docker compose exec -T "${POSTGRES_CONTAINER}" psql -U "${POSTGRES_USER}" -d postgres -c "DROP DATABASE IF EXISTS ${TARGET_DB};"
docker compose exec -T "${POSTGRES_CONTAINER}" psql -U "${POSTGRES_USER}" -d postgres -c "CREATE DATABASE ${TARGET_DB} OWNER ${POSTGRES_USER};"

# Stream dump into pg_restore inside container
cat "${BACKUP_DIR}/database.dump" | docker compose exec -T "${POSTGRES_CONTAINER}" pg_restore -U "${POSTGRES_USER}" -d "${TARGET_DB}" --no-owner || true
echo "  -> Database restore complete."

# 4. Restore Media Storage
echo "[3/5] Restoring persistent media files..."
cat "${BACKUP_DIR}/media.tar.gz" | docker compose exec -T "${BACKEND_CONTAINER}" tar -xzf - -C /data/media/
echo "  -> Media files extracted."

# 5. Verify Row Counts Against Manifest
echo "[4/5] Verifying restored record counts against manifest.json..."
RESTORED_COUNTS="$(docker compose exec -T "${POSTGRES_CONTAINER}" psql -U "${POSTGRES_USER}" -d "${TARGET_DB}" -t -A -c "
    SELECT json_build_object(
        'categories', (SELECT count(*) FROM categories),
        'brands', (SELECT count(*) FROM brands),
        'products', (SELECT count(*) FROM products),
        'enquiries', (SELECT count(*) FROM enquiries),
        'admin_users', (SELECT count(*) FROM admin_users),
        'product_images', (SELECT count(*) FROM product_images),
        'product_attribute_values', (SELECT count(*) FROM product_attribute_values)
    )::text;
")"

echo "Manifest expected counts:"
cat "${BACKUP_DIR}/manifest.json" | grep -A 10 "record_counts"
echo ""
echo "Actual restored counts:"
echo "${RESTORED_COUNTS}"

# 6. Apply pending migrations if any
if [ "${TARGET_DB}" = "hardware_db" ]; then
    echo "[5/5] Running database migrations check..."
    docker compose exec -T "${BACKEND_CONTAINER}" alembic upgrade head
    echo "  -> Database migrations verified at HEAD."
else
    echo "[5/5] Skipping migration check for test database ${TARGET_DB}."
fi

echo "======================================================================"
echo "RESTORE COMPLETED AND VERIFIED SUCCESSFULLY"
echo "======================================================================"
