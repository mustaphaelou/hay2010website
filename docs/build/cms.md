# Embedded Payload CMS — foundation, setup and migration workflow

Status: established by ticket **#29** (foundation). Ticket **#30** extends the
content model and the seed; **#31** runs the migrations in the deployment
pipeline; **#34** writes the operator handover.

Decisions this implements: `docs/content/content-model.md` (§3 source-of-truth
split, §4 roles, §5 content types, §7 media rights, §11 build notes),
`docs/spec/p1-website-build.md` "Admin and editorial rules",
`docs/hosting/deployment-decision.md` (§env, §migrations) and
`docs/build/content-seam.md` §9.

```
/admin                 embedded Payload admin, same origin (app/(payload))
/api                   Payload REST (users, media, pages, …)
/api/graphql           Payload GraphQL
Postgres               content, accounts, sessions, media metadata
S3-compatible bucket   media files in production (Cloudflare R2); local disk in dev/test
```

The public site never queries Payload in a page: it reads through the
`ContentSource` seam (`lib/content/types.ts`). `CONTENT_SOURCE=fixture` is the
default; `CONTENT_SOURCE=cms` activates the Payload provider
(`lib/content/providers/cms.ts`), which is loaded through a dynamic `import()`
so the fixture build and the whole `npm test` suite never bundle or boot Payload.

---

## 1. Packages (pinned)

| Package | Version | Notes |
| --- | --- | --- |
| `payload` | 3.94.2 | core, Local/REST/GraphQL API |
| `@payloadcms/next` | 3.94.2 | `withPayload`, admin views/layouts, route handlers |
| `@payloadcms/db-postgres` | 3.94.2 | Postgres adapter (Drizzle + node-postgres) |
| `@payloadcms/richtext-lexical` | 3.94.2 | rich text (content fields in #30) |
| `@payloadcms/ui` | 3.94.2 | custom admin components (#30 dashboard) |
| `@payloadcms/translations` | 3.94.2 | French admin (`fr` + `en`) |
| `@payloadcms/storage-s3` | 3.94.2 | R2 **via the S3 API** — do not add `storage-r2` (Workers only) |
| `graphql` | 16.15.0 | peer `^16.8.1`; do **not** install GraphQL 17 |
| `sharp` | 0.35.4 | image sizes/crops; prebuilt binary works on Node 26 |
| `cross-env` | 7.0.3 | `NODE_OPTIONS=--no-deprecation` in package scripts |

`next` stays 16.4.6 (`@payloadcms/next` peer: `>=16.4.5 <17.0.0`).
Node floor for production images: `>=22.23.5` (Payload `engines`); verified on
Node 26.13.1.

---

## 2. Files

```
payload.config.ts                  config (admin, db, i18n, S3 plugin, types output)
payload-types.ts                   GENERATED — commit (npm run generate:types)
migrations/                        GENERATED — commit (npm run migrate:create)
  <timestamp>_<name>.ts | .json   SQL up/down + schema snapshot for the next diff
  index.ts                        `migrations` array (not wired to prodMigrations, see §5)
collections/Users.ts               accounts + roles (developer / owner / editor)
collections/Media.ts               uploads + rights evidence
collections/Pages.ts               #29 foundation content type (keyed by rubrique)
access/roles.ts                    Access/FieldAccess predicates (the role matrix)
lib/payload/media-rights.ts        rights validation + the publish media gate
lib/payload/storage.ts             S3/R2 options with local-disk fallback
lib/payload/rubrique-keys.ts       code-owned page keys/labels for the admin select
lib/payload/seed-accounts.ts       dev/test account identities (shared with test:cms)
lib/content/providers/cms.ts       the ContentSource implementation (only Payload client)
scripts/seed.ts                    idempotent dev bootstrap seed (payload run)
scripts/test-cms.mjs               `npm run test:cms` (disposable Postgres)
app/(payload)/                     admin layout, REST/GraphQL routes, importMap, custom.scss
app/(frontend)/                    the public site (own root layout; no app/layout.tsx)
```

The app deliberately has **no root `app/layout.tsx`**: `(payload)` and
`(frontend)` are two root layouts, which is only legal when no root layout
exists. Do not add one; `tests/architecture.test.ts` guards it.

Generated files are committed and excluded from ESLint/Prettier:
`payload-types.ts`, `app/(payload)/admin/importMap.js`, `migrations/**`.
Regenerate both after any config change:

```bash
npm run generate:types       # no database needed
npm run generate:importmap   # no database needed (after adding a custom admin component)
```

---

## 3. Environment

| Variable | Scope | Meaning |
| --- | --- | --- |
| `DATABASE_URL` | runtime + build (CMS mode) | Postgres URL. Absent in fixture mode. |
| `PAYLOAD_SECRET` | runtime | Session/cookie signing. 32 random bytes. Never committed. |
| `NEXT_PUBLIC_SERVER_URL` | build-time | Public origin; also Payload `serverURL` (CSRF allowlist, absolute media URLs). |
| `CONTENT_SOURCE` | runtime/build | `fixture` (default, no DB) or `cms`. |
| `S3_ENDPOINT` | runtime | R2 S3 API endpoint (`https://<account>.r2.cloudflarestorage.com`). |
| `S3_REGION` | runtime | `auto` for R2. |
| `S3_BUCKET` | runtime | `hay2010-media`. Unset ⇒ local disk fallback. |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | runtime | R2 credentials. |
| `S3_PUBLIC_URL` | runtime | Public media origin (`https://media.hay2010.ma`). |
| `CMS_SEED_PASSWORD` | dev/test only | Password of the seed accounts; defaults to a documented dev value. Never set in production. |

`S3_*` names are fixed by `docs/hosting/deployment-decision.md` §6.2. The
template with safe example values is `.env.example`.

---

## 4. Clean database — the one documented command

From a **full source checkout** (not the standalone image, §5), with
`DATABASE_URL` and `PAYLOAD_SECRET` exported:

```bash
npm ci
npm run migrate          # ONE command: applies every committed migration from empty
npm run migrate:status   # every row must show Ran = Yes
```

That is the complete schema setup: tables for users, media, pages, drafts
(`_pages_v`), preferences, locks and `payload_migrations`. Optionally seed the
dev bootstrap corpus (three accounts, two media records with rights, the P1
pages — four rubriques plus the two legal utility pages; Réalisations as a draft;
Carrières absent, footer-only and closed at launch; idempotent, safe to re-run):

```bash
npm run seed
```

The seed refuses nothing that is already there and never writes raw SQL, so the
collection hooks (rights validation, publish gate) run exactly as in the admin.

**Local disposable database** (the same recipe `npm run test:cms` automates):

```bash
docker run -d --rm --name hay2010-pg-29 \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=hay2010 \
  -p 5529:5432 postgres:16-alpine
export DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5529/hay2010
export PAYLOAD_SECRET=dev-only-not-a-secret
npm run migrate && npm run seed
npm run migrate:status
```

`postgres:16-alpine` is the locally verified target. Production runs Postgres 17
(deployment decision) — not exercised locally; the adapter is version-agnostic.

---

## 5. Migrations workflow (for #30 / #31)

The adapter is configured **without `prodMigrations`**: migrations are an
explicit deploy step, never a side effect of a build or a process start.

```bash
# after any schema change (collections/globals/fields)
npm run migrate:create -- <name> --skip-empty
git add migrations/ payload-types.ts
npm run migrate            # apply locally against the disposable DB
npm run generate:types     # commit the new types
```

Rules:

1. **`push` is development-only.** Payload only auto-syncs the schema in dev;
   a production/staging/test database must run migrations. Never mix both on one
   database.
2. **Commit the migration, its `.json` snapshot and `migrations/index.ts`.**
   The snapshot is the diff base for the next migration; losing it recreates all
   tables in a second migration.
3. **The schema is environment-independent.** The storage plugin runs with
   `alwaysInsertFields: true`, so `_objectkey` is part of every migration
   whether or not `S3_BUCKET` is set. Without that, a database migrated without
   the plugin fails at the first upload with
   `column "_objectkey" does not exist` once R2 is enabled.
4. **Do not add `prodMigrations`.** Payload would run migrations when it
   initializes during `next build` (CMS pages are prerendered from the
   database), which can block on an interactive prompt against a database that
   was not migration-managed — the build hangs in CI (verified).
5. **Back up before migrating.** `pg_dump` first; migrations are forward-only, a
   rollback restores the previous image and, if the schema changed
   incompatibly, the pre-migration dump (`docs/hosting/deployment-decision.md`
   §6, #31 runbook).

### The standalone-image trap (#31 must wire it)

The deployed `output: "standalone"` artefact contains `server.js`, the server
bundles, `migrations/` and `payload-types.ts` — but **not `payload.config.ts`
and not the Payload CLI**. `payload migrate` therefore cannot run inside the
running container. Run migrations as an explicit CI/deploy job that uses the
**full source + `node_modules`** (for example a one-off job before the image is
promoted, or a migration stage in the pipeline) with `DATABASE_URL` reachable.
Never on every application start, never concurrently with the old and new
versions. #31 owns the pipeline wiring; this document is the contract.

---

## 6. Roles and access (content model §4)

| Role | Admin label | Can | Cannot |
| --- | --- | --- | --- |
| `developer` | Développeur | everything: accounts, schema-adjacent fields, rights clearance, permanent deletion | — |
| `owner` | Éditeur | edit/publish/unpublish page copy, upload media, clear company-owned media with no people/marks, attach media | delete documented content, manage users, write rights evidence |
| `editor` | Contributeur | create/edit drafts | publish (enforced by `preventEditorPublish`, not just a query constraint), clear rights, delete published content |

Implementation notes:

- `access/roles.ts` holds the predicates; `Access` and `FieldAccess` are two
  different signatures in Payload 3.94.2 — do not reuse one for the other.
- A query constraint on `update` hides the Publish button for the editor but
  does **not** stop an API `PATCH { "_status": "published" }`; the
  `beforeChange` hook throws `Forbidden` (403) — covered by `npm run test:cms`.
- Field-level access on an optional field drops a forbidden value silently; on
  create, a required field with a forbidden value returns 400. Assert stored
  values, not only status codes.
- Anonymous `GET /api/users` and any anonymous write answer 403. Anonymous
  content reads only return published documents (`readPublishedOrStaff`).

---

## 7. Media rights gate (content model §7)

Three layers, all implemented in #29:

1. `media.beforeChange` (`validateMediaRights`): a record cannot be saved as
   `cleared` without a `rightsReference`; identifiable people require
   `releaseStatus: cleared`; client marks require **both** `clientPermission`
   and `trademarkPermission`.
2. Referencing collections (`pages.cover` today; #30 extends the field list)
   run `publishedMediaRightsHook`: publishing a document whose upload is not
   cleared is rejected with a 400 on the upload field. The hook merges
   `originalDoc` + `data` because an update is a delta and an upload relation
   arrives as an id — the naive `data.cover` check silently publishes uncleared
   media.
3. The content adapter only returns cleared media, and anonymous media reads
   are filtered to `rightsStatus: cleared`, so a revocation hides the file on
   the next render even if a hook missed a path.

Owner vs developer: the owner may set `rightsStatus` only on a
`company-owned` image with `peoplePresent: false` and `clientMarks: false`;
every rights-evidence field is developer-only.

### Object storage

- Production: `S3_BUCKET` set ⇒ `@payloadcms/storage-s3` with `region: auto`,
  `forcePathStyle: true`, uploads to `S3_ENDPOINT`, public URLs generated from
  `S3_PUBLIC_URL`, `disablePayloadAccessControl: true` (R2 buckets are private;
  the custom domain is the public origin).
- Dev/CI: `S3_BUCKET` unset ⇒ Payload local disk under `./media` (gitignored).
  `npm run test:cms` exercises this fallback end to end, including the generated
  image sizes (`thumbnail 400`, `card 800`, `hero 1920`, `og 1200×630`).
- Real R2 upload/delete is **not** verified locally (no credentials); #31/#34
  verify it on staging.

---

## 8. Verification

```bash
# the merge gate — database-free, fixture content source
rm -rf .next && npm run typecheck && npm run lint && TEST_HTTP_PORT=31NN npm test

# the CMS acceptance check — disposable Postgres, no fixture
npm run test:cms
```

`npm run test:cms` (`scripts/test-cms.mjs`) starts `postgres:16-alpine` as
`hay2010-pg-29` on port **5529**, applies the committed migrations from empty,
re-runs them (no-op), seeds, builds with `CONTENT_SOURCE=cms`, serves on port
**3129**, runs `tests/cms/**` through Vitest, then removes the container, the
local uploads and the build. It is separate from `npm test` on purpose.

What it proves over HTTP:

| Assertion | Expected |
| --- | --- |
| `GET /admin`, `GET /admin/login` | 200, same origin, `lang="fr"`, French login title |
| authenticated `GET /admin` (owner cookie) | 200 dashboard |
| anonymous `GET /api/users`, `POST /api/pages` | 403 |
| wrong password login | 401/403 |
| anonymous `GET /api/pages`, `GET /api/media` | published pages only, cleared media only |
| media file route (cleared / pending) | 200 `image/png` (with generated sizes) / 403-404 |
| `GET /a-propos` | 200, navigation derived from CMS publish state, draft absent |
| `GET /realisations` (draft in DB) | 404 with the branded 404 document |
| owner `DELETE` a page / a media | 403 (developer delete: 200) |
| editor publish | 403 (editing a draft: 200) |
| owner publish with a rights-pending cover | 400 on `cover` |
| developer clears rights incoherently | 400; with reference + release: 200 |
| owner publish after clearance, then unpublish | 200 / 200 |
| object storage config mapping | pure unit test (R2 + local fallback) |

---

## 9. Gate resolution in CMS mode (trade-off)

In fixture mode `proxy.ts` resolves the publication gate per request and
rewrites a closed route to the branded `/_not-found` document without touching a
database. In CMS mode the proxy returns `unknown` and stays **database-free**;
the render-side guards (`requirePublishedRubrique` / `requirePublishedDomain`)
resolve the CMS gate at build time (pages are prerendered) or per request for
dynamic routes, and `app/(frontend)/not-found.tsx` renders the branded 404.

Consequences, accepted for #29 and revisited by #30:

- CMS gates are as fresh as the last build/revalidation — #30 adds publish
  revalidation (`revalidateTag(tag, "max")` in Next 16) so an unpublish shows up
  without a rebuild;
- no per-request Postgres query in the proxy (the research note's recommended
  cheap path).

---

## 10. What #29 leaves to #30 (extension points)

- **Content types**: the structured globals/collections of `content-model.md` §5
  (homepage, entreprise, services, projects, jobs, communiqués, domains,
  actualités) replace the transient `pages.blocks` JSON field and fill the seam
  methods that currently return empty (`listPublishedDomains`, `getDomain`,
  `getActualites`, `getOpenJobs`). Domain routes and job openings therefore show
  their honest empty state in CMS mode until then.
- **Careers channel (F-113)**: `getCareersChannel()` is code-owned deployment
  state in the CMS provider (`recruitment@` only when the gate is live, with the
  real CNDP reference; `contact@` otherwise, fail closed). The admin can never
  open it — that would be a gated claim (content model §3, facts register §3).
- **Seed parity**: replace the foundation seed with the fixture corpus
  (`content/fixtures/site.json` + `p1` scenario) so #33 can compare fixture vs
  CMS route matrices.
- **Gate visibility**: admin shows the gate state/reason derived read-only from
  the code-owned registry (`lib/site/rubriques.ts`, `lib/flags.ts`); the CMS
  cannot open a P2/P3 tier (the provider checks the tier on every read).
- **Revalidation and preview**: `afterChange`/`afterDelete` hooks →
  `revalidateTag(tag, "max")` / `revalidatePath`; draft preview.
- **Custom admin UI**: brand `custom.scss`, dashboard widgets and the read-only
  "Company facts" panel (`@payloadcms/ui`), then `npm run generate:importmap`.
- **Media gates on new types**: pass the new upload fields to
  `publishedMediaRightsHook([...])`; do not hand-roll a second rights check.
- **Email**: no email adapter is configured (password reset writes to console).
  #31/#34 configure SMTP/Resend for account recovery; never before.

## 11. Known limitations

- Postgres 17 and real R2 uploads are documented but not verified locally
  (16-alpine and the local-disk fallback are).
- The admin has no 2FA and no login rate limiting in the codebase; #31 puts the
  staging host behind the access layer, and #34 documents account ownership.
- `pages.blocks` is a developer-only JSON field: it is a #29 bridge, not the
  owner-editable content model.
- `npm run test:cms` needs Docker and a free port 5529/3129; it removes its
  container and uploads on success, and keeps `.next` on failure for debugging.
