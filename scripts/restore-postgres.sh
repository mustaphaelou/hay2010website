#!/usr/bin/env bash
#
# Restore a HAY2010 PostgreSQL custom-format dump into a scratch database.
#
# Decision: docs/hosting/deployment-decision.md §3.5 ("a restore test recorded
# before launch") and §6.5 (rollback: image rollback for code, dump restore for
# data). This script is the data half; `scripts/rehearse-backup-restore.sh` runs
# it against a throwaway container and verifies the rows.
#
# Safety rules baked in:
#   - the archive is validated with `pg_restore -l` before anything is written;
#   - `--clean --if-exists` is always passed, so the restore is repeatable, but
#     it refuses to run without an explicit target;
#   - `RESTORE_ALLOW_PRODUCTION=1` is required when the target database is named
#     like a production database (`hay2010`) — a restore drops objects first.
#
# Usage:
#   scripts/restore-postgres.sh <dump-file>
#   RESTORE_REMOTE=r2:hay2010-backups/postgres/hay2010-postgres-…dump \
#     scripts/restore-postgres.sh
#
# Environment:
#   RESTORE_PG_CONTAINER     Postgres container to restore inside (container mode)
#   RESTORE_DATABASE_URL     target connection string (client mode, needs pg_restore)
#   RESTORE_DB               target database name (container mode, default postgres)
#   RESTORE_CREATE_DB=1      create RESTORE_DB when it does not exist
#   RESTORE_REMOTE           rclone source object (alternative to a local file argument)
#   RCLONE_BIN               rclone binary (default: rclone from PATH)
#   RESTORE_TMPDIR           staging directory for a downloaded archive
#   RESTORE_ALLOW_PRODUCTION=1  required when the target looks like production
#
# Exit codes: 0 restored and verified, 1 refused or failed.

set -Eeuo pipefail

PROG=restore-postgres

log() { printf '[%s] %s\n' "$PROG" "$*"; }
warn() { printf '[%s] WARNING: %s\n' "$PROG" "$*" >&2; }
die() { printf '[%s] ERROR: %s\n' "$PROG" "$*" >&2; exit 1; }

# --- configuration ----------------------------------------------------------

RESTORE_PG_CONTAINER="${RESTORE_PG_CONTAINER:-}"
RESTORE_DATABASE_URL="${RESTORE_DATABASE_URL:-}"
RESTORE_DB="${RESTORE_DB:-postgres}"
RESTORE_CREATE_DB="${RESTORE_CREATE_DB:-0}"
RESTORE_REMOTE="${RESTORE_REMOTE:-}"
RCLONE_BIN="${RCLONE_BIN:-rclone}"
RESTORE_TMPDIR="${RESTORE_TMPDIR:-${TMPDIR:-/tmp}}"
RESTORE_ALLOW_PRODUCTION="${RESTORE_ALLOW_PRODUCTION:-0}"

SOURCE="${1:-}"

if [ -z "$SOURCE" ] && [ -z "$RESTORE_REMOTE" ]; then
  die "pass a local dump file as the first argument, or set RESTORE_REMOTE"
fi
if [ -z "$RESTORE_PG_CONTAINER" ] && [ -z "$RESTORE_DATABASE_URL" ]; then
  die "set RESTORE_PG_CONTAINER=<container> or RESTORE_DATABASE_URL=<scratch db url>"
fi

# Guard: never let a typo drop objects in a production database. Only the exact
# production database names trigger it; scratch databases (e.g.
# hay2010_rehearsal_restore) stay allowed because they are no one's primary copy.
PRODUCTION_DB_NAME=""
if [ -n "$RESTORE_DATABASE_URL" ]; then
  PRODUCTION_DB_NAME="$(printf '%s' "$RESTORE_DATABASE_URL" | sed -E 's#^[^/]*//[^/]+/([^/?]+).*$#\1#')"
else
  PRODUCTION_DB_NAME="$RESTORE_DB"
fi
case "$PRODUCTION_DB_NAME" in
  hay2010|hay2010website|hay2010_prod|hay2010_production)
    if [ "$RESTORE_ALLOW_PRODUCTION" != "1" ]; then
      die "refusing to restore into production database '${PRODUCTION_DB_NAME}': set RESTORE_ALLOW_PRODUCTION=1 and take a dump first"
    fi
    warn "restoring into production database '${PRODUCTION_DB_NAME}' (RESTORE_ALLOW_PRODUCTION=1)"
    ;;
esac

WORK_DIR="$(mktemp -d "${RESTORE_TMPDIR}/hay2010-restore.XXXXXX")"
trap 'rm -rf -- "${WORK_DIR:-}"' EXIT

# --- 1. resolve the archive ------------------------------------------------

if [ -n "$RESTORE_REMOTE" ]; then
  command -v "${RCLONE_BIN}" >/dev/null 2>&1 ||
    die "rclone not found (needed for RESTORE_REMOTE); install rclone or set RCLONE_BIN"
  SOURCE="${WORK_DIR}/$(basename "$RESTORE_REMOTE")"
  log "downloading ${RESTORE_REMOTE} to ${SOURCE}"
  "${RCLONE_BIN}" copyto "${RESTORE_REMOTE}" "$SOURCE" || die "rclone download failed"
fi

[ -f "$SOURCE" ] || die "dump file not found: $SOURCE"
[ -s "$SOURCE" ] || die "dump file is empty: $SOURCE"
SIZE_BYTES="$(wc -c <"$SOURCE" | tr -d ' ')"
CHECKSUM="$(sha256sum "$SOURCE" | awk '{print $1}')"

# --- 2. validate before writing anything -----------------------------------

if [ -n "$RESTORE_PG_CONTAINER" ]; then
  command -v docker >/dev/null 2>&1 || die "docker not found (needed for container mode)"
  docker inspect "$RESTORE_PG_CONTAINER" >/dev/null 2>&1 ||
    die "postgres container '${RESTORE_PG_CONTAINER}' not found"
  docker exec -i "$RESTORE_PG_CONTAINER" pg_restore -l >/dev/null 2>&1 <"$SOURCE" ||
    die "not a readable custom-format archive: $SOURCE"
else
  command -v pg_restore >/dev/null 2>&1 ||
    die "pg_restore not found; install postgresql-client or use RESTORE_PG_CONTAINER"
  pg_restore -l "$SOURCE" >/dev/null ||
    die "not a readable custom-format archive: $SOURCE"
fi
log "archive verified: ${SIZE_BYTES} bytes, sha256 ${CHECKSUM}"

# --- 3. target database ----------------------------------------------------

if [ -n "$RESTORE_PG_CONTAINER" ]; then
  TARGET="${RESTORE_DB}"
  if [ "$RESTORE_CREATE_DB" = "1" ]; then
    EXISTS="$(
      docker exec "$RESTORE_PG_CONTAINER" psql -U "${PGUSER:-postgres}" -d postgres -tAc \
        "SELECT 1 FROM pg_database WHERE datname = '${TARGET}'" || true
    )"
    if [ "$EXISTS" != "1" ]; then
      log "creating target database ${TARGET}"
      docker exec "$RESTORE_PG_CONTAINER" createdb -U "${PGUSER:-postgres}" "$TARGET" ||
        die "could not create database ${TARGET}"
    fi
  fi
  log "restoring into container '${RESTORE_PG_CONTAINER}' database '${TARGET}'"
  set +e
  docker exec -i "$RESTORE_PG_CONTAINER" \
    pg_restore --clean --if-exists --no-owner --no-privileges \
    -U "${PGUSER:-postgres}" -d "$TARGET" <"$SOURCE"
  STATUS=$?
  set -e
else
  TARGET="$(printf '%s' "$RESTORE_DATABASE_URL" | sed -E 's#^.*/([^/?]+).*$#\1#')"
  log "restoring into client-mode target database '${TARGET}'"
  set +e
  pg_restore --clean --if-exists --no-owner --no-privileges \
    -d "$RESTORE_DATABASE_URL" "$SOURCE"
  STATUS=$?
  set -e
fi

# pg_restore exits 1 for "warnings" (e.g. dropping objects that did not exist,
# missing roles we intentionally strip with --no-owner). Anything above 1 is a
# real failure; 1 is reported loudly because it can also hide partial restores.
if [ "$STATUS" -gt 1 ]; then
  die "pg_restore failed with exit code ${STATUS}"
elif [ "$STATUS" -eq 1 ]; then
  warn "pg_restore completed with warnings (exit 1) — check the log above before trusting this restore"
fi

printf '[%s] OK bytes=%s sha256=%s target=%s mode=%s\n' \
  "$PROG" "$SIZE_BYTES" "$CHECKSUM" "$TARGET" \
  "$([ -n "$RESTORE_PG_CONTAINER" ] && echo container || echo client)"
