# HAY2010 operations runbook

**Status:** first deployment target decided — `docs/hosting/deployment-decision.md`.
**Scope:** what a second operator needs to run, deploy, roll back, back up, restore
and hand over the site without the original developer.
**This file contains no secret.** Real secrets are in Coolify (runtime) and
GitHub Actions (deploy/backup); their location is recorded here, never their value.

---

## 1. Ownership and where things live

Recorded at handover; fill in and keep the filled copy **outside the repository**
if it contains personal contact details. Inventory of what must exist:

| Item | Owner | Where it lives | Access |
|---|---|---|---|
| Domain `hay2010.ma` | HAY2010 | NINDO HOST registrar | owner + developer |
| Cloudflare zone `hay2010.ma` | HAY2010 | Cloudflare account (HAY2010) | owner + developer |
| VPS (Coolify) | developer for first deployment (written agreement) | Hetzner/provider account | developer, SSH keys only |
| Coolify dashboard | developer | `<VPS host>:<port>` behind SSH tunnel / Access | developer + owner |
| Postgres `hay2010-postgres` | HAY2010 (data) | Coolify database resource, internal network only | via Coolify |
| R2 `hay2010-media` (public, versioned) | HAY2010 | Cloudflare R2 | owner + developer |
| R2 `hay2010-backups` (private) | HAY2010 | Cloudflare R2 | owner + developer |
| GitHub repository | developer for now, HAY2010 at handoff | GitHub | owner + developer |
| GHCR package | GitHub repository | GitHub Packages | CI (`GITHUB_TOKEN`), VPS read token |
| SMTP / mailboxes | HAY2010 | HeberjaHiz cPanel (`mail.hay2010.ma`) | owner |

Exit path (decision §3.3): content exports as `pg_dump`/Payload JSON, media from R2,
DNS records, this repository and the image tags. The runbook must be usable
without the developer.

### Incident contacts (placeholders — fill at handover)

| Role | Name | Channel |
|---|---|---|
| Technical owner (developer) | `<name>` | `<phone / email>` |
| HAY2010 owner | `<name>` | `<phone / email>` |
| VPS provider support | `<provider>` | `<support URL>` |
| Mail host (HeberjaHiz) | — | `<support URL>` |

Escalation: site down → developer; mail down → HAY2010 owner + HeberjaHiz;
Cloudflare account locked → HAY2010 owner (account holder).

---

## 2. Environments

| Environment | URL | Image tag | `SITE_ENV` |
|---|---|---|---|
| Staging | `https://staging.hay2010.ma` (Phase 0: temporary protected Coolify hostname) | full commit sha | `staging` |
| Production | later, #16 | full commit sha | unset / `production` |

Staging is protected by **Cloudflare Access** (owner + developer emails, one-time
PIN, 24 h session; decision §7) and is `noindex` twice over: Cloudflare Access
blocks crawlers and the app sends `X-Robots-Tag: noindex, nofollow` plus a
disallow-all `/robots.txt`. Do not weaken either.

A second operator's staging access = an Access policy entry + a Coolify account
(or the SSH tunnel + dashboard credentials). Access is managed in the Cloudflare
dashboard, not in this repository.

---

## 3. Environment variables

Names and purpose only; values are set in **Coolify → application → Environment
Variables** (runtime) and in **GitHub → Settings → Secrets and variables** (CI).
`.env.example` is the committed template.

| Variable | Scope | Purpose |
|---|---|---|
| `SITE_ENV` | runtime | `staging` = noindex + disallow-all robots; anything else = production |
| `FORMS_ENABLED` | runtime | forms kill switch, default `false`; P1 also has a code floor (`lib/flags.ts`) |
| `NEXT_PUBLIC_SERVER_URL` | **build-time** | canonical site URL for metadata (#32); change requires a new image |
| `APP_VERSION` | build-time (CI) | commit sha reported by `/api/health` as `version` |
| `DATABASE_URL` | runtime secret | internal Postgres URL; absent in fixture mode |
| `PAYLOAD_SECRET` | runtime secret | Payload session/cookie signing (#29) |
| `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` | runtime secret | stable Server Action encryption |
| `REVALIDATE_SECRET` | runtime secret | bearer secret for the scheduled revalidation route (#32) |
| `S3_ENDPOINT`, `S3_REGION=auto`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL` | runtime | R2 media bucket |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`, `MAIL_TO_CONTACT` | runtime secret | transactional mail / later contact form |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | runtime | keep unset while forms are disabled |

GitHub repository **secrets**: `COOLIFY_API_TOKEN`, `COOLIFY_APP_UUID`,
`R2_BACKUP_READ_KEY_ID`, `R2_BACKUP_READ_SECRET`, `CF_ACCESS_CLIENT_ID`,
`CF_ACCESS_CLIENT_SECRET`. **Variables**: `COOLIFY_API_URL`,
`NEXT_PUBLIC_SERVER_URL`, `STAGING_URL`, `STAGING_SMOKE_ENABLED`,
`R2_BACKUP_ENDPOINT`, `R2_BACKUP_BUCKET`.

Rotate on handoff: Coolify API token, GHCR read token, R2 tokens, GitHub
secrets. Never put a value in an image build arg, a commit or a CI log.

---

## 4. Deploy and roll back

The pipeline and the manual commands are in [`docs/ops/deploy.md`](deploy.md).
Short version:

- merge to `main` → verify → ARM64 image `ghcr.io/mustaphaelou/hay2010website:<sha>`
  → Coolify PATCH tag + deploy + wait for the health check;
- rollback = pin the previous sha (Rollback workflow or Coolify UI) and redeploy,
  ~1–3 minutes including the image pull;
- verify with `GET /api/health` (`version` = the running sha).

**Migration rule:** take a dump before any migration-bearing deploy and run
migrations as an explicit pre-deploy step, never on app start. An image rollback
does not undo a migration; incompatible migrations require the pre-migration
dump. Details: `docs/ops/deploy.md` §4.

---

## 5. Backups

**Nightly job:** Coolify's native database backup schedule (decision §4.1/§4.5):
database `hay2010-postgres` → *Backups* → daily cron `0 0 * * *`, scope *Specific
databases → `hay2010`* (custom `pg_dump` format), **Enable S3** → storage
`hay2010-backups` (R2), retention 14 copies / 30 days / 10 GB, local retention 3,
`missing_backup_notification_days=2`. Configure Coolify notifications
(deployment failure, backup failure, disk threshold) so failures reach a human.

**GitHub Actions adds what CI is good at** (`.github/workflows/backup.yml`,
nightly 03:17 UTC):

1. **Rehearsal** — disposable `postgres:16-alpine` + `rclone serve s3` (a real
   S3 endpoint with SigV4, no container image to pull): dump → rclone upload →
   restore into a scratch database with a conflicting table → verify the rows.
   This proves the scripts still work, every night.
2. **Watchdog** — reads the real R2 bucket with a read-only token and fails when
   the newest non-empty object under `postgres/` is missing or older than 36 h;
   a failed scheduled workflow notifies the developer.

**On-demand dump** (also mandatory before a migration):

```bash
# on the VPS, database container running
PG_CONTAINER=hay2010-postgres PGDATABASE=hay2010 PGUSER=postgres \
BACKUP_RCLONE_REMOTE=r2:hay2010-backups/postgres \
  bash scripts/backup-postgres.sh
```

The script verifies the archive (`pg_restore -l`) before uploading, checks the
remote size, and applies retention. R2 rclone configuration (environment only):

```bash
export RCLONE_CONFIG=/dev/null
export RCLONE_CONFIG_R2_TYPE=s3
export RCLONE_CONFIG_R2_PROVIDER=Cloudflare
export RCLONE_CONFIG_R2_ACCESS_KEY_ID=…
export RCLONE_CONFIG_R2_SECRET_ACCESS_KEY=…
export RCLONE_CONFIG_R2_REGION=auto
export RCLONE_CONFIG_R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
export RCLONE_CONFIG_R2_ACL=private
export RCLONE_CONFIG_R2_NO_CHECK_BUCKET=true   # some R2 tokens need this
```

### Restore

```bash
# download the object you want to restore (rclone as above)
rclone copyto r2:hay2010-backups/postgres/<file>.dump /tmp/<file>.dump

# restore into a SCRATCH database first, never straight into the live one
RESTORE_PG_CONTAINER=hay2010-postgres RESTORE_DB=hay2010_restore_check \
RESTORE_CREATE_DB=1 RESTORE_ALLOW_PRODUCTION=0 \
  bash scripts/restore-postgres.sh /tmp/<file>.dump

# then verify the expected tables/rows, and only then plan the production restore
```

`scripts/restore-postgres.sh` refuses production-looking database names unless
`RESTORE_ALLOW_PRODUCTION=1` is set; it always restores with
`pg_restore --clean --if-exists --no-owner --no-privileges` so a retry is safe.

Cadence (decision §4.5): monthly backup verification (watchdog passes + spot-check
the newest object), **quarterly restore rehearsal** recorded below, plus one
before launch and after any Postgres major upgrade. Coolify's UI *Import backup*
is the no-shell alternative (restore into a disposable database).

### Restore rehearsal record

The rehearsal is executable: `scripts/rehearse-backup-restore.sh` (or
`npm run rehearse:backup`). It starts its own disposable container and deletes it
afterwards. It fails if the restored rows differ in count or content, or if the
pre-restore conflicting row survives `--clean --if-exists`.

| Date (UTC) | Environment | Result |
|---|---|---|
| 2026-11-26T16:59:11Z | local host, `postgres:16-alpine`, rclone local backend standing in for R2 | **PASS** — 3/3 rows restored, md5 fingerprint identical, stale pre-restore row removed, dump 3 266 bytes, `pg_restore 16.15`. Object store leg repeated nightly in CI against a real S3 endpoint (`rclone serve s3`, `.github/workflows/backup.yml`). |

Exact recorded output of that run:

```
source fingerprint: rows=3 md5=de75a2f7381726719ac0d019374f5565
backup:    verified custom-format archive: 3266 bytes, sha256 b5d6d905…e218f6bb
           upload verified (3266 bytes at destination)
restore:   archive verified: 3266 bytes, sha256 b5d6d905…e218f6bb
           restoring into container … database hay2010_rehearsal_restore
restored data verified: rows=3 md5=de75a2f7381726719ac0d019374f5565, stale row gone
PASSED  date_utc=2026-11-26T16:59:11Z  postgres_image=postgres:16-alpine
        backup_object=…/hay2010-postgres-20261126T165907Z.dump (3266 bytes)
        restored_rows=3  clean_restore=yes
```

Gaps for that record: the local run used rclone's **local** backend for the
object-storage leg (no R2 credentials on this host); the CI nightly runs the same
script against an S3 API endpoint (`rclone serve s3`). A rehearsal against the real `hay2010-backups`
bucket and a restore into a **Postgres 17** database are still operator actions.

---

## 6. Staging access and day-to-day checks

- Staging login: Cloudflare Access (email OTP) — owner + developer emails only.
  Add/remove people in Cloudflare → Access → Applications → `staging.hay2010.ma`.
- CI/monitoring: Cloudflare Access **service token**; requests need
  `CF-Access-Client-Id` / `CF-Access-Client-Secret` headers.
- Health: `GET /api/health` → 200 `{"status":"ok"}`; 503 means a configured
  database is unreachable (the app is fine, do not redeploy blind — check
  Postgres first).
- Deploy history: GitHub Actions + Coolify deployment logs; GitHub `staging`
  environment records deploys.

### Monthly

- [ ] Coolify: OS/Docker/Coolify/Postgres minor updates after a backup; read
      release notes first (`docs/hosting/deployment-decision.md` §7).
- [ ] Backup watchdog has been green for the month; spot-check the newest object.
- [ ] Disk usage on the VPS below threshold; Coolify notifications working.
- [ ] Certificate renewed (Cloudflare origin / Let's Encrypt — automatic unless
      an alert says otherwise).
- [ ] Mailboxes: `contact@` cleanup per legal retention; **before #14** do not
      collect real contact data on staging.
- [ ] Access list still correct (owner + developer only).

### Quarterly

- [ ] Restore rehearsal recorded above (or Coolify *Import backup* into a
      disposable database).
- [ ] Handover check: a second operator can deploy, roll back and restore using
      this runbook only.

---

## 7. Known verification gaps (repo-side vs infrastructure)

Verified from this repository/host: production build + HTTP suite, ops checks
(`/api/health` with no database / unreachable database / reachable database,
staging header + disallow-all robots, forms floor), Docker image build and
container smoke (amd64), backup → object storage → restore rehearsal, workflow
YAML validity.

**Not verified, operator actions (see [`external-steps.md`](external-steps.md)):**
native ARM64 build on `ubuntu-24.04-arm` and GHCR push; Coolify application,
deploy, rollback and health-check behaviour; Cloudflare zone/Access service
token; R2 buckets and the nightly Coolify backup schedule; an external uptime
check; a restore into the production Postgres 17. Do not claim these until they
have been executed and this section is updated with the date and observer.
