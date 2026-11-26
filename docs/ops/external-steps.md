# External steps — operator checklist (not executable from the repository)

Everything below needs accounts, the VPS, Cloudflare or GitHub repository settings.
Each item is an **operator action**; a step marked **VERIFICATION GAP** cannot be
proven from this repository and must be executed and recorded before it is
claimed. Track completion by editing this file (add the date and observer).

---

## 1. GitHub repository settings (owner)

- [ ] **VERIFICATION GAP — ARM64 runner availability.** The image job uses
      `runs-on: ubuntu-24.04-arm`, which GitHub provides for **public**
      repositories (GitHub changelog, 2025-08-07). This repository is public, so
      no extra setup is expected, but the first successful run is the proof. If
      the label is unavailable, use a self-hosted ARM64 runner — never cross-build
      with QEMU (decision §5).
- [ ] Repository secrets (Settings → Secrets and variables → Actions → Secrets):
      `COOLIFY_APP_UUID`, `COOLIFY_API_TOKEN` (abilities: **write + deploy**,
      not a root token), `R2_BACKUP_READ_KEY_ID`, `R2_BACKUP_READ_SECRET`
      (read-only R2 token scoped to `hay2010-backups`), `CF_ACCESS_CLIENT_ID`,
      `CF_ACCESS_CLIENT_SECRET` (Cloudflare Access service token, once Access exists).
- [ ] Repository variables: `COOLIFY_API_URL` (no trailing slash),
      `NEXT_PUBLIC_SERVER_URL`, `STAGING_URL`, `STAGING_SMOKE_ENABLED=true` once
      Access secrets exist, `R2_BACKUP_ENDPOINT`, `R2_BACKUP_BUCKET`.
- [ ] Environment `staging`: created automatically by the first deploy run;
      optional deployment branch rules. Record it in the runbook.
- [ ] Branch protection / ruleset on `main` requiring the `verify` job, so a red
      suite blocks the merge. Without it "blocks on failure" is not true.
      **VERIFICATION GAP** until the ruleset is saved.
- [ ] GHCR package: after the first push, decide **private + read-only GHCR token
      on the VPS** (recommended) or public (irreversible). The image contains no
      secrets by construction.
- [ ] **VERIFICATION GAP — first ARM64 image run:** workflow `CI`, job
      `Build ARM64 image and push to GHCR` green, image visible in GHCR, the
      smoke-test step passes (health 200, `version` = sha, staging header, robots).

## 2. VPS and Coolify (developer)

- [ ] Provision the VPS per decision §3.2: **ARM64**, Ubuntu 24.04 LTS, ≥4 GB RAM
      (8 GB recommended), ≥40 GB SSD, SSH keys only, UFW 22/80/443 only,
      unattended upgrades. Record provider + country.
- [ ] Install Coolify (self-hosted, current version; read release notes first).
      Dashboard not exposed publicly: SSH tunnel, IP allowlist or Access.
- [ ] **VERIFICATION GAP — Coolify application:** type *Docker Image*, image
      `ghcr.io/mustaphaelou/hay2010website`, tag = full commit sha, port `3000`,
      domain `staging.hay2010.ma` (or the Phase 0 protected hostname), no build
      commands, no previews, image retention ≥ 10.
- [ ] Health check: leave Coolify's dashboard HTTP check **disabled** (the image
      has no curl/wget) so Docker uses the image `HEALTHCHECK`, or configure a
      CMD check:
      `node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"`.
- [ ] Runtime environment variables on the application (values from the
      password manager / repository secrets — never committed): decision §6.6 list
      plus `SITE_ENV=staging`, `FORMS_ENABLED=false`. No build args for secrets.
- [ ] Registry login: if the GHCR package is private, add a **read:packages**
      token under Coolify → Registries. Rotate at handoff.
- [ ] **VERIFICATION GAP — deploy through CI:** first push to `main` runs the
      deploy job, Coolify pulls the sha tag, deployment status `finished`,
      `GET /api/health` reports `version` = the sha.
- [ ] **VERIFICATION GAP — rollback by tag:** run `Rollback staging image` with
      the previous sha; record the duration (target: 1–3 minutes) and the health
      `version` afterwards in the runbook.
- [ ] **VERIFICATION GAP — no automatic migrations:** confirm no start command or
      pre-deployment command runs `payload migrate`. Migrations become an explicit
      step in #29/#30 (deploy.md §4).
- [ ] Postgres 17 database resource `hay2010-postgres`, internal network only,
      generated credentials; `DATABASE_URL` given to the app when #29/#30 need it.
      **VERIFICATION GAP:** the health probe's database leg against the real
      production database (local proof used Postgres 16).
- [ ] Notifications: deployment failure, backup failure, disk threshold → the
      developer's email/webhook. Coolify instance backup monthly.
- [ ] Coolify scheduled task (later, #32): daily revalidation. Not part of #31.

## 3. Cloudflare / DNS (gated by #15)

- [ ] Zone `hay2010.ma` active in a HAY2010-owned Cloudflare account (decision
      §3.1: recover the existing zone or delegate a new one at NINDO; preserve MX,
      SPF, DKIM, autodiscover; do not enable Email Routing).
- [ ] `staging` DNS record proxied to the VPS (A/AAAA or Cloudflare Tunnel);
      TLS Full (strict).
- [ ] **VERIFICATION GAP — Cloudflare Access application** on the whole staging
      host: owner + developer emails with one-time PIN, 24 h session, plus a
      **Service Auth** policy for the CI/monitoring service token. Confirm a phone
      login works.
- [ ] Cache rule: bypass all caching on staging (Access responses must not be
      shared).
- [ ] Origin lockdown (Tunnel or Cloudflare IP allowlist) before trusting
      `CF-Connecting-IP` — prerequisite for #12's rate limiting.
- [ ] **VERIFICATION GAP — deploy smoke through Access:** rerun the CI smoke
      step (`STAGING_SMOKE_ENABLED=true`) and confirm 200 + `X-Robots-Tag`.
- [ ] External uptime check on `staging.hay2010.ma/api/health` using the Access
      service token (optional; Coolify notifications are the minimum).

## 4. R2 backups and the nightly dump (developer + owner)

- [ ] R2 bucket `hay2010-backups`: private, no custom domain, object versioning /
      object lock as available. R2 API token **scoped to this bucket only**
      (one token for Coolify's backup integration, one read-only token for the
      watchdog).
- [ ] Coolify → Storage → S3: endpoint `https://<account_id>.r2.cloudflarestorage.com`,
      bucket `hay2010-backups`, region default, R2 keys; *Validate connection*.
- [ ] Coolify → database `hay2010-postgres` → Backups: nightly cron, scope
      *Specific databases → `hay2010`* (custom format), S3 enabled, retention
      configured, `missing_backup_notification_days=2`.
- [ ] **VERIFICATION GAP — first nightly dump lands in R2** (`postgres/…dump`,
      non-empty) and the GitHub `Backup rehearsal and watchdog` workflow's
      watchdog job is green. Record the object key and date in the runbook.
- [ ] **VERIFICATION GAP — restore from the real bucket:** download an actual
      object and restore it into a scratch Postgres 17 database using
      `scripts/restore-postgres.sh`; record the output in the runbook
      (the local rehearsal used postgres:16 + a local stand-in for R2).
- [ ] Media bucket `hay2010-media` (public via `media.hay2010.ma`, versioned) —
      needed by Payload (#29/#30), not by #31.

## 5. Secrets and handover hygiene

- [ ] No secret in the repository, the image or a build arg: `git log -p` /
      `docker history` spot-check. ✓ The repo-side work ships no secret values;
      `.env.example` documents names only.
- [ ] Real values recorded in the password manager with owner + developer access.
- [ ] Rotation on handoff: Coolify API token, GHCR read token, R2 tokens,
      GitHub secrets, Access list.
- [ ] Handover: this runbook + `deploy.md` + `external-steps.md` usable by a
      second operator without the original developer (#34 expands the handover).
