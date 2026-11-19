#!/usr/bin/env bash
# ==============================================================================
# Naseer Plywood & Hardware — Production Backup Utility
# Atomically creates a complete, verified snapshot of PostgreSQL DB and Media.
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

TIMESTAMP="$(date -u +"%Y%m%d_%H%M%S")"
BACKUP_DIR="${1:-${ROOT_DIR}/backups/backup_${TIMESTAMP}}"

POSTGRES_CONTAINER="hardware-postgres"
BACKEND_CONTAINER="hardware-backend"
POSTGRES_USER="${POSTGRES_USER:-hardware_user}"
POSTGRES_DB="${POSTGRES_DB:-hardware_db}"

echo "======================================================================"
echo "STARTING BACKUP: ${TIMESTAMP}"
echo "Target directory: ${BACKUP_DIR}"
echo "======================================================================"

mkdir -p "${BACKUP_DIR}"

# 1. Verify container availability
if ! docker compose ps --services --filter "status=running" | grep -q "^hardware-postgres$"; then
    echo "Error: ${POSTGRES_CONTAINER} is not running. Aborting backup."
    exit 1
fi

# 2. Extract database record count manifest
echo "[1/4] Querying database record counts..."
RECORD_COUNTS="$(docker compose exec -T "${POSTGRES_CONTAINER}" psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -t -A -c "
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

# 3. Dump PostgreSQL Database (Custom compressed format)
echo "[2/4] Dumping PostgreSQL database to database.dump..."
docker compose exec -T "${POSTGRES_CONTAINER}" pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -Fc > "${BACKUP_DIR}/database.dump"
DB_SIZE="$(du -h "${BACKUP_DIR}/database.dump" | cut -f1)"
echo "  -> Database dump created (${DB_SIZE})"

# 4. Archive Media Files
echo "[3/4] Archiving persistent media storage..."
docker compose exec -T "${BACKEND_CONTAINER}" tar -czf - -C /data/media . > "${BACKUP_DIR}/media.tar.gz"
MEDIA_SIZE="$(du -h "${BACKUP_DIR}/media.tar.gz" | cut -f1)"
echo "  -> Media archive created (${MEDIA_SIZE})"

# 5. Create Metadata Manifest
echo "[4/4] Writing metadata manifest and SHA256 checksums..."
GIT_COMMIT="$(git rev-parse HEAD 2>/dev/null || echo 'unknown')"
ACTIVE_RELEASE="$(readlink -f "${ROOT_DIR}/frontend/deploy/current" 2>/dev/null || echo 'none')"

cat <<EOF > "${BACKUP_DIR}/manifest.json"
{
  "timestamp_utc": "${TIMESTAMP}",
  "database": "${POSTGRES_DB}",
  "database_user": "${POSTGRES_USER}",
  "git_commit": "${GIT_COMMIT}",
  "active_release": "${ACTIVE_RELEASE}",
  "record_counts": ${RECORD_COUNTS}
}
EOF

# 6. Generate SHA256 Checksums
(
    cd "${BACKUP_DIR}"
    sha256sum database.dump media.tar.gz manifest.json > SHA256SUMS
)

echo "======================================================================"
echo "BACKUP COMPLETED SUCCESSFULLY"
echo "Location: ${BACKUP_DIR}"
cat "${BACKUP_DIR}/SHA256SUMS"
echo "Record counts:"
echo "${RECORD_COUNTS}"
echo "======================================================================"
