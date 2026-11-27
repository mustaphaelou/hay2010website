# HAY2010 operations runbook

**Status:** first deployment target decided — `docs/hosting/deployment-decision.md`.
**Scope:** what a second operator needs to run, deploy, roll back, back up, restore
and hand over the site without the original developer.
**This file contains no secret.** Real secrets are in Coolify (runtime) and
GitHub Actions (deploy/backup); their location is recorded here, never their value.

---

## 1. Ownership and where things live

Recorded at handover; fill in and keep the filled copy **outside the repository**
if it contains personal contact details. The written confirmation — titulaire réel de chaque actif,
comptes à énumérer, accès délégué, rotation et signature — is the template
[`docs/handover/ownership.md`](../handover/ownership.md); it must be completed, verified and signed.
The table below is the operational summary, not the legal record. Inventory of what must exist:

| Item | Owner | Where it lives | Access |
|---|---|---|---|
| Domain `hay2010.ma` | HAY2010 | NINDO HOST registrar | owner + developer |
| Cloudflare zone `hay2010.ma` | HAY2010 | Cloudflare account (HAY2010) | owner + developer |
| VPS (Coolify) | developer for first deployment (written agreement); target HAY2010 | Hetzner/provider account | developer, SSH keys only |
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

Names and channels are **not** stored in this public repository: they are completed in the signed
ownership record ([`docs/handover/ownership.md`](../handover/ownership.md)) and only the filled contact
block is copied here (or kept beside the printed runbook). The placeholders below are a reminder, not a
filled record.

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

### Admin accounts — bootstrap and recovery

The Payload admin has **no email adapter configured at P1**, so there is no self-service password
reset by email (the console warns "No email adapter provided"); forgotten passwords are reset by a
developer. Accounts are **not** created by the seed in production — `lib/payload/seed-accounts.ts`
uses `@hay2010.test` addresses that are development/test only.

**Fresh database (first deployment, or a recreated CMS database):**

1. Apply the migrations first (§4 and [`docs/build/cms.md`](../build/cms.md) §5), then open
   `https://<host>/admin`. With no user in the database Payload serves the **create-first-user** screen.
2. Create the **developer** account there: real e-mail, long unique password, **Rôle = Développeur**
   (the screen renders every field; the role select is required and must not be left at its default).
3. Sign in, open **Comptes → Créer un compte**, create the **owner** account (real e-mail,
   **Rôle = Éditeur**) and hand the password over in person. The owner changes it at first login
   (**Compte → Changer le mot de passe**).
4. Optional contributor account (**Rôle = Contributeur**) — drafts only, unused at launch.
5. `npm run seed` on a development/staging database also creates three `.test` bootstrap accounts
   (`developpeur@`, `proprietaire@`, `contributeur@hay2010.test`). They exist to make a local CMS
   reproducible: **deactivate or delete them on any database that is not local**, and never publish
   the admin URL with a documented test password.
6. Headless alternative on an empty database (no user yet), same outcome — the endpoint accepts the
   role because first-user creation runs with `overrideAccess`:

   ```bash
   curl -sS -X POST "$ADMIN_ORIGIN/api/users/first-register" \
     -H 'Content-Type: application/json' \
     -d '{"email":"…@hay2010.ma","password":"<long unique>","name":"…","role":"developer"}'
   ```

**Recovery (lost password, no signed-in developer):** the last resort is a one-off Local API script run
against the full source with `DATABASE_URL` set (the standalone image has no Payload CLI); it updates
`users` with `overrideAccess: true` and must run from the server, never from a ticket or a log. Record
the action in the ownership log. No recovery script is committed at P1 — write it on the server and
delete it after use.

Record the real account list in [`docs/handover/ownership.md`](../handover/ownership.md) §3; never in
this public repository.

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
- [ ] Handover check: the owner's training sign-off and the signed ownership record are still valid;
      new content evidence is recorded in [`docs/handover/contenu-attendu.md`](../handover/contenu-attendu.md).

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

---

## 8. Reste à faire côté HAY2010 / opérateur

These are **human or external actions**, not repository deliverables. The code and the procedures
exist; the items below are not done until the named proof is filed and dated. Do not report the
handover as complete while a line is open.

| # | Action | Who | Proof to file | Source |
|---|---|---|---|---|
| 1 | Hold and **record** the two-hour French training; the owner completes one real edit and one publish/unpublish unaided | Developer + owner | Signed session record; recording stored outside the repo | [`docs/handover/formation.md`](../handover/formation.md) §6 |
| 2 | Complete, verify and **sign** the ownership record; rotate delegated credentials | Owner + developer (+ counsel if needed) | Signed record outside the repo; rotation list dated | [`docs/handover/ownership.md`](../handover/ownership.md) |
| 3 | Deploy to the **real staging** and verify ARM64 image, Coolify, Access, rollback, health, backups | Operator | `external-steps.md` items ticked with date + observer | [`deploy.md`](deploy.md), [`external-steps.md`](external-steps.md) |
| 4 | File **CNDP F-211** (contact) and **F-118** (transfers) before public launch; **F-113** before any CV invitation; **F-214** only if analytics is enabled | Owner submits; developer prepares; counsel reviews | Receipt/authorization reference in the policy and the short notice | [`docs/legal/cndp-filings-launch-compliance.md`](../legal/cndp-filings-launch-compliance.md) §2, §12 |
| 5 | Create, **send/receive-test** and publish the mailboxes (`contact@`, `donnees@`, `no-reply@`; `recrutement@` after F-113) | Owner (cPanel) + developer | Test evidence in the filing dossier | `contenu-attendu.md`; facts register §8 |
| 6 | Supply the owner content and evidence per tier (RC extract, both ONEE certificates, permissions, logo ownership, jobs, MHVP) | Owner | Each row of the checklist dated and complete | [`docs/handover/contenu-attendu.md`](../handover/contenu-attendu.md) |
| 7 | Obtain the **structeur's written sign-off** on the CDC deviation register | Structeur | Signed register | [`docs/cdc/deviation-register.md`](../cdc/deviation-register.md) |
| 8 | Read the **P1 audit** (#33) before public launch and archive its evidence | Developer + owner | `docs/build/p1-audit.md` | [`docs/build/`](../build/) |
| 9 | Run a backup **restore test** against the real R2 bucket and the production Postgres major version; record it | Operator | Restore rehearsal record dated | §5 above; `external-steps.md` §4 |
| 10 | Complete the **contacts** block (names, phones, support channels) in the printed runbook | Owner + developer | Filled block kept outside the repo | §1 above |

Re-run the technical verification any time with the commands in
[`docs/handover/README.md`](../handover/README.md) §2 (repo gate, local fixture site, local CMS, `npm run test:cms`).
