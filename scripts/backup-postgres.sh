#!/usr/bin/env bash
#
# Nightly PostgreSQL dump for HAY2010 — off-site copy to S3-compatible storage
# (Cloudflare R2 bucket `hay2010-backups` in production).
#
# Decision: docs/hosting/deployment-decision.md §3.5 and §6. A dump that stays on
# the VPS is not a backup: the file must leave the machine, and the restore path
# must be rehearsed (`scripts/restore-postgres.sh`, run locally by
# `scripts/rehearse-backup-restore.sh` and nightly in CI).
#
# The script is deliberately dual-mode because the database is only reachable
# from inside the VPS Docker network:
#
#   container mode (production, default for the Coolify Postgres resource):
#     PG_CONTAINER=hay2010-postgres \
#     PGUSER=postgres PGDATABASE=hay2010 \
#     BACKUP_RCLONE_REMOTE=r2:hay2010-backups/postgres \
#     ./scripts/backup-postgres.sh
#
#   client mode (a host with psql client tools and a reachable database):
#     DATABASE_URL=postgres://… BACKUP_RCLONE_REMOTE=r2:hay2010-backups/postgres \
#     ./scripts/backup-postgres.sh
#
# Environment:
#   PG_CONTAINER             Postgres container to `docker exec pg_dump` in
#   PGUSER / PGDATABASE      container-mode credentials (default postgres/postgres)
#   DATABASE_URL             client-mode connection string (uses pg_dump from PATH)
#   BACKUP_RCLONE_REMOTE     rclone destination directory, e.g. r2:hay2010-backups/postgres
#                            (required unless BACKUP_NO_UPLOAD=1)
#   RCLONE_BIN               rclone binary (default: rclone from PATH)
#   RCLONE_CONFIG            optional rclone config path (rclone also reads its env)
#   BACKUP_LOCAL_DIR         optional directory to keep the dump on this host too
#   BACKUP_RETENTION_DAYS    remote + local retention in days (default 30; 0 disables)
#   BACKUP_PREFIX            object name prefix (default hay2010-postgres)
#   BACKUP_NO_UPLOAD=1       rehearsal mode: dump and verify, skip object storage
#   TMPDIR                   where the dump is staged before upload
#
# Exit codes: 0 success, 1 anything that would leave you without a good backup.
# The script fails closed: no upload, no success message.
#
# Required tools: docker (container mode) or postgresql-client (client mode),
# two of: du, date; plus rclone when uploading.

set -Eeuo pipefail

PROG=backup-postgres

log() { printf '[%s] %s\n' "$PROG" "$*"; }
warn() { printf '[%s] WARNING: %s\n' "$PROG" "$*" >&2; }
die() { printf '[%s] ERROR: %s\n' "$PROG" "$*" >&2; exit 1; }

# --- configuration ----------------------------------------------------------

PG_CONTAINER="${PG_CONTAINER:-}"
PGUSER="${PGUSER:-postgres}"
PGDATABASE="${PGDATABASE:-postgres}"
DATABASE_URL="${DATABASE_URL:-}"
BACKUP_RCLONE_REMOTE="${BACKUP_RCLONE_REMOTE:-}"
RCLONE_BIN="${RCLONE_BIN:-rclone}"
BACKUP_LOCAL_DIR="${BACKUP_LOCAL_DIR:-}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
BACKUP_PREFIX="${BACKUP_PREFIX:-hay2010-postgres}"
BACKUP_NO_UPLOAD="${BACKUP_NO_UPLOAD:-0}"

if [ -z "$PG_CONTAINER" ] && [ -z "$DATABASE_URL" ]; then
  die "set PG_CONTAINER=<postgres container> (preferred) or DATABASE_URL"
fi
if [ -n "$PG_CONTAINER" ] && [ -n "$DATABASE_URL" ]; then
  die "PG_CONTAINER and DATABASE_URL are mutually exclusive; set one"
fi
if [ "$BACKUP_NO_UPLOAD" != "1" ] && [ -z "$BACKUP_RCLONE_REMOTE" ]; then
  die "set BACKUP_RCLONE_REMOTE (e.g. r2:hay2010-backups/postgres) or BACKUP_NO_UPLOAD=1"
fi
case "$BACKUP_RETENTION_DAYS" in
  ''|*[!0-9]*) die "BACKUP_RETENTION_DAYS must be a non-negative integer" ;;
esac

command -v "${RCLONE_BIN}" >/dev/null 2>&1 || {
  if [ "$BACKUP_NO_UPLOAD" = "1" ]; then
    RCLONE_BIN=""
  else
    die "rclone not found (set RCLONE_BIN or install rclone): https://rclone.org/install/"
  fi
}

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OBJECT_NAME="${BACKUP_PREFIX}-${STAMP}.dump"
WORK_DIR="$(mktemp -d "${TMPDIR:-/tmp}/hay2010-backup.XXXXXX")"
DUMP_FILE="${WORK_DIR}/${OBJECT_NAME}"

cleanup() {
  # The staged dump is only a staging copy: the object storage copy and the
  # optional BACKUP_LOCAL_DIR copy are the durable ones.
  rm -rf -- "${WORK_DIR:-}"
}
trap cleanup EXIT

# --- 1. dump ---------------------------------------------------------------

log "dumping database ${PGDATABASE} (container=${PG_CONTAINER:-none}) to ${DUMP_FILE}"

if [ -n "$PG_CONTAINER" ]; then
  command -v docker >/dev/null 2>&1 || die "docker not found (needed for container mode)"
  docker inspect "$PG_CONTAINER" >/dev/null 2>&1 ||
    die "postgres container '${PG_CONTAINER}' not found"
  docker exec -i "$PG_CONTAINER" pg_dump -Fc -U "$PGUSER" -d "$PGDATABASE" >"$DUMP_FILE" ||
    die "pg_dump failed inside container '${PG_CONTAINER}'"
else
  command -v pg_dump >/dev/null 2>&1 ||
    die "pg_dump not found; install postgresql-client or use PG_CONTAINER mode"
  pg_dump -Fc --no-owner --no-privileges "$DATABASE_URL" >"$DUMP_FILE" ||
    die "pg_dump failed"
fi

# --- 2. verify the archive before it leaves the host -----------------------

[ -s "$DUMP_FILE" ] || die "the dump is empty — refusing to upload it"

if [ -n "$PG_CONTAINER" ]; then
  docker exec -i "$PG_CONTAINER" pg_restore -l >/dev/null 2>&1 <"$DUMP_FILE" ||
    die "the dump is not a readable custom-format archive (pg_restore -l failed)"
else
  command -v pg_restore >/dev/null 2>&1 ||
    die "pg_restore not found; cannot verify the dump (install postgresql-client)"
  pg_restore -l "$DUMP_FILE" >/dev/null ||
    die "the dump is not a readable custom-format archive (pg_restore -l failed)"
fi

SIZE_BYTES="$(wc -c <"$DUMP_FILE" | tr -d ' ')"
CHECKSUM="$(sha256sum "$DUMP_FILE" | awk '{print $1}')"
log "verified custom-format archive: ${SIZE_BYTES} bytes, sha256 ${CHECKSUM}"

# --- 3. upload off-site ----------------------------------------------------

UPLOADED_TO=""
if [ "$BACKUP_NO_UPLOAD" = "1" ]; then
  log "BACKUP_NO_UPLOAD=1 — skipping object storage (rehearsal mode)"
else
  log "uploading to ${BACKUP_RCLONE_REMOTE}/${OBJECT_NAME}"
  "${RCLONE_BIN}" copyto "${DUMP_FILE}" "${BACKUP_RCLONE_REMOTE}/${OBJECT_NAME}" ||
    die "rclone upload failed"
  UPLOADED_TO="${BACKUP_RCLONE_REMOTE}/${OBJECT_NAME}"

  REMOTE_SIZE="$(
    "${RCLONE_BIN}" lsl "${UPLOADED_TO}" 2>/dev/null | awk 'NR==1 {print $1}'
  )"
  if [ -n "$REMOTE_SIZE" ] && [ "$REMOTE_SIZE" != "$SIZE_BYTES" ]; then
    die "uploaded object is ${REMOTE_SIZE} bytes, expected ${SIZE_BYTES}"
  fi
  log "upload verified (${REMOTE_SIZE:-unknown} bytes at destination)"
fi

# --- 4. retention ----------------------------------------------------------

if [ -n "$BACKUP_LOCAL_DIR" ]; then
  mkdir -p -- "$BACKUP_LOCAL_DIR"
  cp -- "$DUMP_FILE" "${BACKUP_LOCAL_DIR}/${OBJECT_NAME}"
  log "local copy kept at ${BACKUP_LOCAL_DIR}/${OBJECT_NAME}"
  if [ "$BACKUP_RETENTION_DAYS" -gt 0 ]; then
    find "$BACKUP_LOCAL_DIR" -maxdepth 1 -type f -name "${BACKUP_PREFIX}-*.dump" \
      -mtime "+${BACKUP_RETENTION_DAYS}" -print -delete
    log "local retention applied (keep ${BACKUP_RETENTION_DAYS} days)"
  fi
fi

if [ "$BACKUP_NO_UPLOAD" != "1" ] && [ "$BACKUP_RETENTION_DAYS" -gt 0 ]; then
  log "applying remote retention: delete ${BACKUP_PREFIX}-*.dump older than ${BACKUP_RETENTION_DAYS} days"
  "${RCLONE_BIN}" delete \
    --min-age "${BACKUP_RETENTION_DAYS}d" \
    --include "${BACKUP_PREFIX}-*.dump" \
    "${BACKUP_RCLONE_REMOTE}" ||
    warn "remote retention failed (backup itself succeeded)"
fi

# --- summary ---------------------------------------------------------------

printf '[%s] OK database=%s bytes=%s sha256=%s object=%s local_dir=%s\n' \
  "$PROG" "$PGDATABASE" "$SIZE_BYTES" "$CHECKSUM" \
  "${UPLOADED_TO:-none}" "${BACKUP_LOCAL_DIR:-none}"

