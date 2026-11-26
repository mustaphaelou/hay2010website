# Deploying HAY2010 — CI → GHCR → Coolify

**Audience:** the developer/operator deploying the site, and whoever takes over.
**Decision record:** [`docs/hosting/deployment-decision.md`](../hosting/deployment-decision.md)
(the stack is decided; this document is the procedure). **Secrets live in Coolify
and GitHub, never in this repository.**

Staging URL: `https://staging.hay2010.ma` (behind Cloudflare Access, decision §1/§6).
Phase 0 before the zone is delegated: a temporary protected Coolify hostname.

---

## 1. The pipeline (one image per merge)

```
push to main ──► verify (ubuntu-24.04-arm)
                   npm ci · typecheck · lint · npm test · npm run check:ops
                   · backup/restore rehearsal on a disposable Postgres
                 └─► image (push only, native arm64, no QEMU)
                       docker build (REQUIRE_ARM64=1) → GHCR :<full-commit-sha>
                       pull the pushed tag · run it · check /api/health,
                       X-Robots-Tag, /robots.txt
                 └─► deploy (main only)
                       PATCH Coolify application docker_registry_image_tag=<sha>
                       POST /api/v1/deploy · poll until status=finished
                       optional: smoke the staging URL through Cloudflare Access
```

Workflow: [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml).
Every merge is blocked on `verify`; the image job runs only for pushes (PRs
verify the code, not the registry). The merged commit is the image tag — the
sha is the rollback unit, and `latest` is never used (decision §5).

The first run on `integ/p1-website` builds an image but does not deploy; staging
follows `main`, as the decision states.

## 2. What makes one image work on staging and production

The image is **identical** for both environments. Everything that differs is a
runtime variable set in Coolify:

| Variable | Staging | Production (later) |
|---|---|---|
| `SITE_ENV` | `staging` | unset or `production` |
| `FORMS_ENABLED` | `false` | `false` until F-211 |
| `NEXT_PUBLIC_SERVER_URL` | staging URL (build-time) | production URL (build-time) |

`SITE_ENV=staging` makes `proxy.ts` add `X-Robots-Tag: noindex, nofollow` to every
response and serve a disallow-all `/robots.txt`. Production behaviour is
untouched; flipping the variable needs a restart, not a rebuild.

## 3. Manual deploy (when CI is unavailable)

Prerequisites: `COOLIFY_API_URL` (e.g. `https://coolify.example.com`), an API
token with **write + deploy** abilities, the application UUID, and a commit sha
that already has an image in GHCR.

```bash
# Pin the image tag on the application
curl --fail --silent --show-error -X PATCH \
  "$COOLIFY_API_URL/api/v1/applications/$COOLIFY_APP_UUID" \
  -H "Authorization: Bearer $COOLIFY_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"docker_registry_image_tag":"<full-commit-sha>"}'

# Deploy and capture the deployment uuid
curl --fail --silent --show-error -X POST \
  "$COOLIFY_API_URL/api/v1/deploy?uuid=$COOLIFY_APP_UUID" \
  -H "Authorization: Bearer $COOLIFY_API_TOKEN"

# Watch it (repeat until finished / failed)
curl --fail --silent --show-error \
  "$COOLIFY_API_URL/api/v1/deployments/<deployment_uuid>" \
  -H "Authorization: Bearer $COOLIFY_API_TOKEN" | jq '.status'
```

Expected: Coolify pulls the tag (~420 MB the first time), starts the container,
waits for the health check and switches traffic. A container that starts but
fails `/api/health` keeps the previous release running.

**Why PATCH then POST:** Coolify's deploy webhook only deploys the application's
*saved* image tag — it cannot carry a new one. The `docker_tag` deploy parameter
only applies to preview deployments. Verified against the Coolify 4.7.9 API
contract (note §2, §7): `docker_registry_image_tag` on the application + the
deploy endpoint.

## 4. Rollback by tag (target: minutes)

The image tag is the rollback unit.

**Option A — GitHub Actions:** run **Rollback staging image**
([`.github/workflows/rollback.yml`](../../.github/workflows/rollback.yml)) with the
previous commit sha and a reason. It pins the tag, redeploys and waits.

**Option B — Coolify UI (second operator):** application → *General → Docker
Registry → Docker Image Tag or Hash* → previous full sha → **Save** → **Redeploy**
→ watch *Deployment Logs* until healthy.

**Option C — CLI:** the PATCH + deploy + poll sequence from §3 with the previous
sha.

After a rollback, verify the release actually serving:

```bash
curl -sS https://staging.hay2010.ma/api/health   # needs the Access service token
# -> {"status":"ok","service":"hay2010-website","version":"<sha>",…}
```

### Migration caveat (forward-only)

An image rollback does **not** reverse a database migration. There are no
migrations before Payload (#29/#30), but the procedure is decided now:

1. **No migration in the failed release** → rollback by tag only.
2. **Backward-compatible migration** → rollback by tag, fix forward.
3. **Incompatible migration** → stop the app, restore the pre-migration dump
   (Coolify *Import backup* or `scripts/restore-postgres.sh`), then roll back the
   image tag and redeploy.

Before any migration-bearing release, take a dump:

```bash
docker exec hay2010-postgres pg_isready -U postgres
PG_CONTAINER=hay2010-postgres PGDATABASE=hay2010 \
BACKUP_RCLONE_REMOTE=r2:hay2010-backups/postgres \
  bash scripts/backup-postgres.sh
```

**Migrations never run on application start.** With `output: "standalone"` the
runtime image contains only traced files — no Payload CLI, no `payload.config.ts`.
The planned path (decision §6.3, note §7): build the Dockerfile `migrator` stage as a
separate tag and run it once, before the new app container takes traffic:

```bash
docker build --target migrator -t <image>:<sha>-migrate .
docker run --rm --env-file /path/to/app.env <image>:<sha>-migrate npx payload migrate
```

CI wiring for that belongs to #29/#30.

## 5. Coolify application configuration (operator, one-time)

Recorded in [`docs/ops/external-steps.md`](external-steps.md) §2. Summary:

- application type **Docker Image**: `ghcr.io/mustaphaelou/hay2010website`, tag
  = full commit sha, port `3000`, domain `staging.hay2010.ma`;
- health check: leave the dashboard HTTP check **disabled** (the image has no
  curl/wget) so Docker uses the image `HEALTHCHECK`, or use a CMD check with the
  same `node -e "fetch(...)"` command;
- runtime environment variables from the decision §6.6 plus `SITE_ENV=staging`,
  `FORMS_ENABLED=false`;
- image retention (“images to keep”) ≥ 10 so local rollback candidates survive
  Docker cleanup; Coolify's own rollback tab relies on images still on the host,
  which is why tag pinning is the documented path;
- no build commands, no automatic migrations on start, no preview deployments.

## 6. Verification after a deploy

1. Deployment log: `finished`, container healthy.
2. `GET /api/health` → 200, `"status":"ok"`, `"version"` = the deployed sha.
3. `GET /` → 200 with `X-Robots-Tag: noindex, nofollow`.
4. `GET /robots.txt` → `User-agent: *` / `Disallow: /`.
5. The site renders (header, main, footer) — a full content check is #33.

## 7. What is verified, what is not (this repository, 2026-11-26)

Verified locally on this x86_64 host:

- production build, HTTP suite and ops checks (`/api/health` no-DB/down/up,
  staging header + robots, forms floor);
- Docker image builds and runs (amd64 locally), health + staging header +
  robots verified in the running container;
- backup → rclone → restore rehearsal with verified rows (see runbook record);
- workflow YAML valid per `actionlint 1.7.7`.

**Not verified here (operator/infrastructure):** the native ARM64 image build
and GHCR push (needs `ubuntu-24.04-arm`), any real Coolify deploy/rollback, the
real R2 bucket, Cloudflare Access, the nightly Coolify backup schedule, and
Postgres 17 production behaviour (the rehearsal uses 16). These are listed as
gaps in [`docs/ops/external-steps.md`](external-steps.md).
