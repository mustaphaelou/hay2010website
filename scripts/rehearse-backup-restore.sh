#!/usr/bin/env bash
#
# Restore rehearsal — proves the HAY2010 backup path end to end on disposable
# infrastructure, without touching any real database.
#
# Decision: docs/hosting/deployment-decision.md §3.5 ("a restore test recorded
# before launch") and §4.5 ("monthly backup verification, quarterly restore
# test"). This is the executable version of the rehearsal recorded in
# docs/ops/runbook.md; `.github/workflows/backup.yml` runs it nightly.
#
# What it does:
#   1. starts a throwaway `postgres:16-alpine` container (unique name and port);
#   2. creates a source database with a small, known table (three rows);
#   3. runs scripts/backup-postgres.sh against it, uploading to an
#      S3-compatible destination (rclone);
#   4. pre-seeds a *scratch* database with a conflicting table, then runs
#      scripts/restore-postgres.sh from the uploaded object — this exercises the
#      `--clean --if-exists` path, not just an empty-database import;
#   5. verifies the restored rows byte-for-byte against the source and that the
#      conflicting pre-restore row is gone;
#   6. removes the container and the temporary files.
#
# Object storage:
#   - default: a directory under a temporary path, used through rclone's local
#     backend. The rclone command path is identical; only the backend differs;
#   - CI: REHEARSAL_RCLONE_REMOTE points at a MinIO bucket with a generated
#     rclone config, so the S3 code path runs on every nightly rehearsal;
#   - production R2: the same script with the real rclone remote (operator).
#
# Environment (all optional):
#   REHEARSAL_ID              suffix for the container name (default: $$)
#   REHEARSAL_PG_CONTAINER    container name (default hay2010-pg-rehearsal-<id>)
#   REHEARSAL_PG_PORT         host port bound to the disposable Postgres (default 55431)
#   REHEARSAL_PG_IMAGE        image (default postgres:16-alpine)
#   REHEARSAL_RCLONE_REMOTE   rclone destination directory (default: local temp dir)
#   RCLONE_BIN                rclone binary (default: rclone from PATH)
#   RCLONE_CONFIG             rclone config file (rclone also reads its own env)
#
# Never run this against a production database: every name it creates is prefixed
# with the rehearsal id and removed by the EXIT trap.

set -Eeuo pipefail

PROG=rehearse-backup-restore
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

log() { printf '[%s] %s\n' "$PROG" "$*"; }
die() { printf '[%s] ERROR: %s\n' "$PROG" "$*" >&2; exit 1; }

RUN_ID="${REHEARSAL_ID:-$$}"
CONTAINER="${REHEARSAL_PG_CONTAINER:-hay2010-pg-rehearsal-${RUN_ID}}"
PORT="${REHEARSAL_PG_PORT:-55431}"
IMAGE="${REHEARSAL_PG_IMAGE:-postgres:16-alpine}"
PG_PASSWORD="${REHEARSAL_PG_PASSWORD:-rehearsal-not-a-secret}"
SOURCE_DB="${REHEARSAL_SOURCE_DB:-hay2010_rehearsal_source}"
SCRATCH_DB="${REHEARSAL_SCRATCH_DB:-hay2010_rehearsal_restore}"
RCLONE_BIN="${RCLONE_BIN:-rclone}"

command -v docker >/dev/null 2>&1 || die "docker is required for the rehearsal"
command -v "${RCLONE_BIN}" >/dev/null 2>&1 ||
  die "rclone is required (the backup script uploads through it); set RCLONE_BIN or install https://rclone.org/install/"

WORK_DIR="$(mktemp -d "${TMPDIR:-/tmp}/hay2010-rehearsal.XXXXXX")"
REMOTE="${REHEARSAL_RCLONE_REMOTE:-${WORK_DIR}/object-storage/postgres}"

cleanup() {
  if docker inspect "$CONTAINER" >/dev/null 2>&1; then
    docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
    log "removed disposable container ${CONTAINER}"
  fi
  rm -rf -- "${WORK_DIR:-}"
}
trap cleanup EXIT

# --- 0. refuse to collide with an unrelated container ----------------------

case "$CONTAINER" in
  hay2010-pg-rehearsal-*) ;;
  *) die "REHEARSAL_PG_CONTAINER must be named hay2010-pg-rehearsal-* so cleanup can never touch another container" ;;
esac
if docker inspect "$CONTAINER" >/dev/null 2>&1; then
  die "container ${CONTAINER} already exists; remove it or set REHEARSAL_ID"
fi
if docker ps --format '{{.Ports}}' | grep -q ":${PORT}->"; then
  die "host port ${PORT} is already in use; set REHEARSAL_PG_PORT"
fi

# --- 1. disposable Postgres ------------------------------------------------

log "starting disposable ${IMAGE} as ${CONTAINER} on 127.0.0.1:${PORT}"
docker run -d --rm --name "$CONTAINER" \
  -e POSTGRES_PASSWORD="$PG_PASSWORD" \
  -p "127.0.0.1:${PORT}:5432" \
  "$IMAGE" >/dev/null

READY=0
for _ in $(seq 1 60); do
  if docker exec "$CONTAINER" pg_isready -U postgres -q >/dev/null 2>&1; then
    READY=1
    break
  fi
  sleep 1
done
[ "$READY" = "1" ] || die "Postgres did not become ready within 60s"
log "Postgres is ready"

# --- 2. known source data --------------------------------------------------

log "creating source database ${SOURCE_DB} with 3 known rows"
docker exec "$CONTAINER" createdb -U postgres "$SOURCE_DB"
docker exec -i "$CONTAINER" psql -U postgres -d "$SOURCE_DB" -v ON_ERROR_STOP=1 >/dev/null <<'SQL'
CREATE TABLE realisations (
  id serial PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  published boolean NOT NULL DEFAULT false
);
INSERT INTO realisations (slug, published) VALUES
  ('poste-transformation-rabat', true),
  ('eclairage-public-sale', true),
  ('maintenance-hta', false);
SQL

EXPECTED_ROWS="$(
  docker exec "$CONTAINER" psql -U postgres -d "$SOURCE_DB" -tAc \
    "SELECT count(*) FROM realisations"
)"
EXPECTED_SHA="$(
  docker exec "$CONTAINER" psql -U postgres -d "$SOURCE_DB" -tAc \
    "SELECT md5(string_agg(slug || '|' || published::text, ',' ORDER BY slug)) FROM realisations"
)"
[ "$EXPECTED_ROWS" = "3" ] || die "unexpected source row count: ${EXPECTED_ROWS}"
log "source fingerprint: rows=${EXPECTED_ROWS} md5=${EXPECTED_SHA}"

# --- 3. backup to the object store ----------------------------------------

log "running scripts/backup-postgres.sh against ${REMOTE}"
BACKUP_LOG="${WORK_DIR}/backup.log"
(
  cd "$ROOT_DIR"
  PG_CONTAINER="$CONTAINER" \
  PGUSER=postgres \
  PGDATABASE="$SOURCE_DB" \
  BACKUP_RCLONE_REMOTE="$REMOTE" \
  BACKUP_RETENTION_DAYS=30 \
  RCLONE_BIN="$RCLONE_BIN" \
    bash scripts/backup-postgres.sh
) | tee "$BACKUP_LOG"
grep -q ' OK ' "$BACKUP_LOG" || die "backup script did not report success"
OBJECT="$(sed -n 's/.*object=\([^ ]*\).*/\1/p' "$BACKUP_LOG" | tail -1)"
[ -n "$OBJECT" ] && [ "$OBJECT" != "none" ] || die "backup script reported no object"
OBJECT_SIZE="$(sed -n 's/.*bytes=\([0-9]*\).*/\1/p' "$BACKUP_LOG" | tail -1)"
log "stored object: ${OBJECT} (${OBJECT_SIZE} bytes)"

# The object must really be in the destination, not only in the log.
REMOTE_OBJECT_SIZE="$("$RCLONE_BIN" lsl "$OBJECT" 2>/dev/null | awk 'NR==1 {print $1}')"
[ "$REMOTE_OBJECT_SIZE" = "$OBJECT_SIZE" ] ||
  die "object size mismatch: destination has '${REMOTE_OBJECT_SIZE}', expected '${OBJECT_SIZE}'"
log "destination object verified (${REMOTE_OBJECT_SIZE} bytes)"

# --- 4. conflicting scratch database, then restore ------------------------

log "pre-seeding scratch database ${SCRATCH_DB} with conflicting data"
docker exec "$CONTAINER" createdb -U postgres "$SCRATCH_DB"
docker exec -i "$CONTAINER" psql -U postgres -d "$SCRATCH_DB" -v ON_ERROR_STOP=1 >/dev/null <<'SQL'
CREATE TABLE realisations (
  id integer PRIMARY KEY,
  slug text,
  published boolean
);
INSERT INTO realisations (id, slug, published) VALUES (999, 'stale-row-must-disappear', true);
SQL

log "running scripts/restore-postgres.sh from the object store into ${SCRATCH_DB}"
RESTORE_LOG="${WORK_DIR}/restore.log"
(
  cd "$ROOT_DIR"
  RESTORE_PG_CONTAINER="$CONTAINER" \
  RESTORE_DB="$SCRATCH_DB" \
  RESTORE_REMOTE="$OBJECT" \
  RESTORE_TMPDIR="$WORK_DIR" \
  RCLONE_BIN="$RCLONE_BIN" \
    bash scripts/restore-postgres.sh
) | tee "$RESTORE_LOG"
grep -q ' OK ' "$RESTORE_LOG" || die "restore script did not report success"

# --- 5. verify the restored data ------------------------------------------

RESTORED_ROWS="$(
  docker exec "$CONTAINER" psql -U postgres -d "$SCRATCH_DB" -tAc \
    "SELECT count(*) FROM realisations"
)"
RESTORED_SHA="$(
  docker exec "$CONTAINER" psql -U postgres -d "$SCRATCH_DB" -tAc \
    "SELECT md5(string_agg(slug || '|' || published::text, ',' ORDER BY slug)) FROM realisations"
)"
STALE_ROWS="$(
  docker exec "$CONTAINER" psql -U postgres -d "$SCRATCH_DB" -tAc \
    "SELECT count(*) FROM realisations WHERE slug = 'stale-row-must-disappear'"
)"

[ "$RESTORED_ROWS" = "$EXPECTED_ROWS" ] ||
  die "row count mismatch after restore: got ${RESTORED_ROWS}, expected ${EXPECTED_ROWS}"
[ "$RESTORED_SHA" = "$EXPECTED_SHA" ] ||
  die "row fingerprint mismatch after restore: got ${RESTORED_SHA}, expected ${EXPECTED_SHA}"
[ "$STALE_ROWS" = "0" ] ||
  die "the pre-restore stale row survived: --clean --if-exists did not replace the table"

log "restored data verified: rows=${RESTORED_ROWS} md5=${RESTORED_SHA}, stale row gone"

# --- 6. record ------------------------------------------------------------

printf '\n%s\n' "================ RESTORE REHEARSAL PASSED ================"
printf 'date_utc        : %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
printf 'postgres_image  : %s\n' "$IMAGE"
printf 'source_db       : %s (%s rows)\n' "$SOURCE_DB" "$EXPECTED_ROWS"
printf 'backup_object   : %s (%s bytes)\n' "$OBJECT" "$OBJECT_SIZE"
printf 'scratch_db      : %s (pre-seeded with conflicting table)\n' "$SCRATCH_DB"
printf 'restored_rows   : %s (md5 %s)\n' "$RESTORED_ROWS" "$RESTORED_SHA"
printf 'clean_restore   : yes (stale row removed by --clean --if-exists)\n'
printf 'object_backend  : %s\n' "$REMOTE"
printf 'rdbms_client    : %s\n' "$(docker exec "$CONTAINER" pg_restore --version | head -1)"
printf '===========================================================\n'
