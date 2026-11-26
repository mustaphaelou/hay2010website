# Embedded Payload CMS — content model, seed, gates and migration workflow

Status: established by ticket **#29** (foundation); content types, seed,
fixture parity, gate visibility and revalidation added by ticket **#30**.
**#31** wires the migrations into the deployment pipeline; **#32/#33** own the
crawler surface and the final audit; **#34** writes the operator handover.

Decisions this implements: `docs/content/content-model.md` (§3 source-of-truth
split, §4 roles, §5 content types, §6 relationships/gates, §7 media rights,
§10.2 seed, §11 build notes), `docs/spec/p1-website-build.md` "Admin and
editorial rules", `docs/hosting/deployment-decision.md` (§env, §migrations) and
`docs/build/content-seam.md` §9–§10.

```
/admin                 embedded Payload admin, same origin (app/(payload))
/api                   Payload REST (users, media, domaines, jobs, communiques …)
/api/globals/<slug>    Payload global REST (POST updates a global)
/api/graphql           Payload GraphQL
Postgres               content, accounts, sessions, media metadata
S3-compatible bucket   media files in production (Cloudflare R2); local disk in dev/test
```

The public site never queries Payload in a page: it reads through the
`ContentSource` seam (`lib/content/types.ts`). `CONTENT_SOURCE=fixture` is the
default; `CONTENT_SOURCE=cms` activates the Payload provider
(`lib/content/providers/cms.ts`), loaded through a dynamic `import()` so the
fixture build and the whole `npm test` suite never bundle or boot Payload.

---

## 1. Packages (pinned)

| Package | Version | Notes |
| --- | --- | --- |
| `payload` | 3.94.2 | core, Local/REST/GraphQL API |
| `@payloadcms/next` | 3.94.2 | `withPayload`, admin views/layouts, route handlers |
| `@payloadcms/db-postgres` | 3.94.2 | Postgres adapter (Drizzle + node-postgres) |
| `@payloadcms/richtext-lexical` | 3.94.2 | rich text for the prose fields |
| `@payloadcms/ui` | 3.94.2 | custom admin dashboard panels (#30) |
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
collections/Media.ts               uploads + rights evidence + revocation revalidation
collections/Domaines.ts            domain pages + prestations (one record per domain)
collections/Projects.ts            named case studies, permission-gated publishing
collections/Jobs.ts                job openings rendered inline on /carrieres
collections/Communiques.ts         gated actualités (company announcements)
globals/Homepage.ts                Accueil trame
globals/Entreprise.ts              À propos trame
globals/Metiers.ts                 domain index trame
globals/Realisations.ts            Réalisations trame
globals/Contact.ts                 Contact trame (email-first)
globals/Carrieres.ts               Carrières trame (openings come from `jobs`)
globals/Actualites.ts              gated Actualités listing trame (model only)
access/roles.ts                    Access/FieldAccess predicates (the role matrix)
lib/payload/media-rights.ts        rights validation + publish media gate (collections & globals)
lib/payload/content-map.ts         code-owned map: rubrique→global, tiers, gate reasons, domain keys
lib/payload/link-targets.ts        code-owned internal-link enum (no free URLs in the CMS)
lib/payload/fields.ts              shared field builders (seo group, rich text, CTA, items)
lib/payload/rich-text.ts           Lexical paragraphs ⇄ plain paragraphs (seed/provider)
lib/payload/revalidate.ts          publish hooks: revalidatePath/revalidateTag(tag, "max")
lib/payload/storage.ts             S3/R2 options with local-disk fallback
lib/payload/seed-accounts.ts       dev/test account identities (shared with test:cms)
lib/site/facts.ts                  code-owned « repères » (approved facts, never CMS)
lib/content/providers/cms.ts       the ContentSource implementation (only Payload client)
components/admin/dashboard-panels.tsx  read-only gate + code-owned constants panels
scripts/seed.ts                    idempotent seed reproducing the fixture corpus
scripts/test-cms.mjs               `npm run test:cms` (disposable Postgres + parity + HTTP suite)
scripts/parity.mjs                 fixture-vs-CMS route-matrix capture and comparison
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
npm run generate:importmap   # no database needed (after adding/changing a custom admin component)
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

## 4. Content model (#30)

The schema implements `docs/content/content-model.md` §5 against the trames the
P1 tickets #22–#28 actually render. Every field the owner can edit is rendered
by a page; every string in `lib/payload/content-map.ts` is a code decision.

### 4.1 Page globals (singletons, drafts + publish/unpublish)

| Global | Site route | Fields (content model names kept) |
| --- | --- | --- |
| `homepage` | `/` | `hero` (title, subtitle, image, two link-target CTAs), `intro.body`, `servicesBand.title`, `referencesTeaser` (fallbackText, body, link), `engagements[]`, `contactCta`, `seo` |
| `entreprise` | `/a-propos` | `hero.title` (h1), `intro.body`, `chapters[]` (title + titled items), `contactCta`, `seo` |
| `metiers` | `/domaines-activite` | `title`, `intro.body`, `seo` — the domain list itself is derived from published domains |
| `realisations` | `/realisations` | `title`, `hero` (accroche + two CTAs), `intro` (+ link), `servicesBand.title`, `qualifications.title`, `references` (title, fallbackText, body, items, link), `documentation`, `method`, `contactCta`, `seo` |
| `contact` | `/contact` | `title`, `intro.body`, `contactCta` (no link: the mailto is code-owned), `sections`, `steps`, `seo` |
| `carrieres` | `/carrieres` | `hero` (title, subtitle), `intro.body`, `seo` — openings come from `jobs` |
| `actualites` | `/actualites` (gated) | `hero`, `intro`, `seo` — model only; the P3 route stays closed |

- Drafts are explicit (`autosave: false`): the owner publishes/unpublishes and
  the record is never deleted by them. The editor role is draft-only; a
  `beforeChange` hook throws `Forbidden` on any publish attempt (a query
  constraint alone does not block an API PATCH).
- `seo.description` is the page meta description; `seo.title` and the share
  image are stored for #32's metadata system (at P1 the page title drives the
  `<title>`; #32 owns the patterns and the OG policy).

### 4.2 Collections

| Collection | Public surface | Fields / rules |
| --- | --- | --- |
| `domaines` | `/domaines-activite/{slug}` | `slug` (code-owned enum, developer-only), `title`, `summary`, `presentation`, `prestations[]`, `methods[]`, `contactCta`, `seo`; publish validation refuses an empty trame |
| `jobs` | inline on `/carrieres` | `title`, `slug`, `openingStatus` (open/closed), `contractType`, `location`, `department`, `experienceLevel`, `summary`, `description`, `responsibilities[]`, `requirements[]`, `postedAt`, `closingAt` (validated after posting date), `applicationEmail` (code-owned, developer-only), `featured`, drafts. No detail route, no application form, no CV upload, no `JobPosting` data |
| `projects` | none at P1 (gated family) | Case studies: `clientName` requires `clientPermission` + reference; an anonymized card requires `evidenceReference`; images pass the media-rights gate; a testimonial requires its permission. Publishable only when the permission fields are recorded |
| `communiques` | none at P1 (gated actualités) | `publishedAt`, `excerpt`, `cover`, `body`, `legalReviewed`/`legalReviewRef` (developer-only), maximum six per calendar year, publish refused without the legal review |
| `media` | rights-cleared files only | #29 rights evidence; the owner may clear only company-owned images with no people/marks |
| `users` | none | #29 roles: `developer` / `owner` / `editor` |

**Field name note:** the jobs opening state is `openingStatus`, not `status`.
A drafts-enabled Payload collection reserves the `enum_<collection>_status` enum
for its `_status` column, so a field literally named `status` produces a broken
migration (verified). The content model's "status" semantics are unchanged.

### 4.3 Code-owned, never CMS-editable

Modelled nowhere in Payload, therefore impossible to edit from the admin:

- legal identity (`lib/site/company.ts`, `lib/legal/identity.ts`) and the legal
  pages' approved copy (rendered from `lib/legal/`, no CMS document);
- approved claims and the ONEE agréments wording (`lib/site/claims.ts`);
- the homepage « repères » band (`lib/site/facts.ts`, injected by the provider);
- the qualification position and the case-study gate (`lib/site/realisations.ts`);
- navigation labels/order, routes, tiers and gate reasons
  (`lib/site/rubriques.ts`, `lib/payload/content-map.ts`);
- SEO patterns/defaults (`lib/seo/*`: canonical origin, title template, launch
  metadata table — #32 delivered the system, the CMS stores no default);
- the F-113 careers mailbox state and the internal-link destinations
  (`lib/payload/link-targets.ts`).
- `domaines.slug`, `jobs.applicationEmail` and every permission/review reference
  are developer-only **fields** (verified over HTTP: an owner write is dropped
  or rejected, the stored value never changes).

### 4.4 Gate visibility in the admin (#30)

`admin.components.beforeDashboard` renders two read-only panels above the
dashboard, from code literals only (no database, so a CMS record can never
change them):

1. **Barrières de publication (code-owned)** — every gated P2/P3 page, the two
   code-gated domains, the named-case-study family, with the reason and the
   plain statement that the admin cannot open them;
2. **Barrières et interrupteurs associés** — `caseStudiesLive`, `actualitesLive`,
   `agrementLive`, `recrutementMailboxLive`, `mapLive`, `formLive`, with state
   and reason;
3. **Constantes code-owned (référence en lecture seule)** — identity block,
   approved claims, navigation labels/tiers and SEO defaults, for copying only.

Opening a gate is always a code change (and, for a claim, a facts-register
change). Publishing a record for a code-gated page or domain is allowed and has
no public effect: the content adapter checks the code-owned gate before the CMS
publish state (`npm run test:cms` asserts this for a published
`energies-renouvelables` record).

---

## 5. Clean database — the one documented command

From a **full source checkout** (not the standalone image, §6), with
`DATABASE_URL` and `PAYLOAD_SECRET` exported:

```bash
npm ci
npm run migrate          # ONE command: applies every committed migration from empty
npm run migrate:status   # every row must show Ran = Yes
```

That is the complete schema setup: tables for users, media, the seven page
globals (+ their draft version tables), the four content collections, drafts,
preferences, locks and `payload_migrations`. Then seed the corpus (#30):

```bash
npm run seed
```

The seed is idempotent (a re-run creates nothing twice and never overwrites an
admin edit), refuses nothing that is already there, and writes through the Local
API (never raw SQL), so the collection hooks (rights validation, publish gates)
run exactly as in the admin. See §8 for what it creates.

**Local disposable database** (the same recipe `npm run test:cms` automates):

```bash
docker run -d --rm --name hay2010-pg-30 \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=hay2010 \
  -p 5530:5432 postgres:16-alpine
export DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5530/hay2010
export PAYLOAD_SECRET=dev-only-not-a-secret
npm run migrate && npm run seed
npm run migrate:status
```

`postgres:16-alpine` is the locally verified target. Production runs Postgres 17
(deployment decision) — not exercised locally; the adapter is version-agnostic.

---

## 6. Migrations workflow (for #30 / #31)

The adapter is configured **without `prodMigrations`**: migrations are an
explicit deploy step, never a side effect of a build or a process start.

```bash
# after any schema change (collections/globals/fields)
npm run migrate:create -- <name> --skip-empty
git add migrations/ payload-types.ts
npm run migrate            # apply locally against the disposable DB
npm run generate:types     # commit the new types
```

`migrate:create` must run with the S3 plugin state (#29 rule): run it with the
`S3_*` variables set (any bucket value) so the `_objectkey` column stays in the
generated SQL, or rely on the plugin's `alwaysInsertFields: true` (already set
in `lib/payload/storage.ts`). It does not connect to the database
(`disableDBConnect`).

**#30 schema note:** the #29 `pages` foundation collection was replaced by the
structured globals/collections. Because no deployment had run #29's migration
yet, the migration history was regenerated as a single initial migration
(`migrations/<timestamp>_initial_cms_content_types.ts`) before #31 wires the
pipeline: `migrate` from empty creates the final schema in one step. If a
database already ran the #29 migration, its operator must recreate it before
launch (nothing in production used it; #31 owns the pipeline).

Rules:

1. **`push` is development-only.** Payload only auto-syncs the schema in dev;
   a production/staging/test database must run migrations. Never mix both on one
   database.
2. **Commit the migration, its `.json` snapshot and `migrations/index.ts`.**
   The snapshot is the diff base for the next migration; losing it recreates all
   tables in a second migration.
3. **The schema is environment-independent.** The storage plugin runs with
   `alwaysInsertFields: true`, so `_objectkey` is part of every migration
   whether or not `S3_BUCKET` is set. `npm run test:cms` asserts it.
4. **Do not add `prodMigrations`.** Payload would run migrations when it
   initializes during `next build` (CMS pages are prerendered from the
   database), which can block on an interactive prompt against a database that
   was not migration-managed — the build hangs in CI (verified, #29).
5. **Back up before migrating.** `pg_dump` first; migrations are forward-only, a
   rollback restores the previous image and, if the schema changed
   incompatibly, the pre-migration dump (`docs/hosting/deployment-decision.md`
   §6, #31 runbook).
6. A dropout Payload enum collision: a drafts-enabled collection cannot have a
   select field named `status` (it collides with `_status`); use a distinct name
   such as `openingStatus` (`jobs`).

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

## 7. Roles and access (content model §4)

| Role | Admin label | Can | Cannot |
| --- | --- | --- | --- |
| `developer` | Développeur | everything: accounts, schema-adjacent fields, rights clearance, permanent deletion, code-owned permission references | — |
| `owner` | Éditeur | edit/publish/unpublish page copy, domain content and prestations, create/publish/close jobs, upload media, clear company-owned media with no people/marks | delete documented content, manage users, write rights evidence, edit a domain route key or a job application address |
| `editor` | Contributeur | create/edit drafts | publish (enforced by `preventEditorPublish`/`preventEditorPublishGlobal`, not just a query constraint), clear rights, delete published content |

Implementation notes:

- `access/roles.ts` holds the predicates; `Access` and `FieldAccess` are two
  different signatures in Payload 3.94.2 — do not reuse one for the other.
- A query constraint on `update` hides the Publish button for the editor but
  does **not** stop an API `PATCH { "_status": "published" }`; the
  `beforeChange` hook throws `Forbidden` (403) — covered by `npm run test:cms`
  for collections and globals.
- Field-level access on an optional field drops a forbidden value silently; on
  create, a required field with a forbidden value returns 400. Assert stored
  values, not only status codes (`domaines.slug`, `jobs.applicationEmail`).
- Anonymous `GET /api/users` and any anonymous write answer 403. Anonymous
  content reads only return published documents.
- The seed and the admin write through the same hooks; `overrideAccess: true`
  is only used by the seed (no authenticated user).

---

## 8. The seed (#30)

`scripts/seed.ts` reproduces the fixture corpus of `content/fixtures/site.json`
with the launch gate state of `content/fixtures/scenarios/p1.json`:

- the three seed accounts (`lib/payload/seed-accounts.ts`);
- two **test-only** media records — one rights-pending, one cleared — used by
  the verification suite to prove the rights gate and the revocation behaviour.
  The launch corpus has no photography (`content/fixtures/site.json` `media: []`)
  and the seeded pages never reference these files;
- the six published page globals (Accueil, À propos, Domaines index,
  Réalisations, Contact, Carrières) with the decided French copy read from the
  fixture file;
- the five domain records, three published and two code-gated drafts
  (`energies-renouvelables`, `fourniture-equipements`);
- the three job openings as drafts (no opening is confirmed at launch, matching
  the fixture `p1` scenario);
- nothing invented: no lorem ipsum, no gated claim, no founding year, no phone.

The seed is idempotent: it skips an existing account/media/global/collection
record (by email, filename, global presence and unique slug), so re-running it
in development never duplicates or overwrites an owner edit. `npm run test:cms`
runs it twice and asserts the second run is a no-op.

---

## 9. Media rights gate (content model §7)

Three layers, all implemented in #29 and extended by #30 to the new content
types:

1. `media.beforeChange` (`validateMediaRights`): a record cannot be saved as
   `cleared` without a `rightsReference`; identifiable people require
   `releaseStatus: cleared`; client marks require **both** `clientPermission`
   and `trademarkPermission`.
2. Every publishing type runs `publishedMediaRightsHook` on its upload fields —
   `homepage.hero.image`, `seo.ogImage` on every page global,
   `projects.cover`, `projects.gallery.*.image`, `communiques.cover`. Publishing
   a document whose upload is not cleared is rejected with a validation error
   on the field. The hook merges `originalDoc` + `data` because an update is a
   delta and an upload relation arrives as an id (the naive `data.cover` check
   silently publishes uncleared media — verified in #29 research).
3. The content adapter only returns cleared media, and anonymous media reads are
   filtered to `rightsStatus: cleared`.

Revocation: `media.afterChange` invalidates the whole frontend layout
(`revalidatePath("/", "layout")`) so an image that loses its rights disappears
from every page that references it, without a rebuild. `npm run test:cms`
attaches a cleared image, publishes the page, revokes the rights and asserts the
image is gone from the rendered page while the page still renders.

Owner vs developer: the owner may set `rightsStatus` only on a `company-owned`
image with `peoplePresent: false` and `clientMarks: false`; every rights-evidence
field is developer-only.

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
- `next/image` receives relative same-origin URLs for the local-disk fallback
  (the provider normalises `serverURL`-absolute URLs); R2 public URLs stay
  absolute and need a `images.remotePatterns` entry, owned by #32/#31.

---

## 10. Revalidation (publish without a rebuild)

`lib/payload/revalidate.ts` is called from the `afterChange`/`afterDelete` hooks
of every global and collection:

- `revalidatePath` for the affected route(s), `/sitemap.xml`, and
  `revalidatePath("/", "layout")` for any gate-/media-affecting change (the
  header/footer render the published set on every page, so a publish/unpublish
  moves the navigation everywhere; the site is small and content changes are a
  few per quarter — content model §8.4);
- `revalidateTag(tag, "max")` with the Next 16 two-argument signature for the
  documented content tags (`homepage`, `page:entreprise`, `domains`, `jobs`,
  `media`, …);
- the helper swallows the "no Next request store" case: the seed runs through
  `payload run` (outside Next), where `revalidatePath` throws; a seed does not
  need cache invalidation and a write must not fail because of it.

`npm run test:cms` proves the observable effect on the production server: an
owner PATCH of page copy is followed by a GET of the page (no rebuild) that
contains the new copy; an unpublish makes the route answer 404; a media
revocation removes a published image; publishing a job makes it appear on
`/carrieres`.

Draft preview (signed preview URLs, Next draft mode) is **not** implemented at
P1; it stays a #34 handover note.

---

## 11. Gate resolution in CMS mode

In fixture mode `proxy.ts` resolves the publication gate per request and
rewrites a closed route to the branded `/_not-found` document without touching a
database.

In CMS mode the proxy stays **database-free** and resolves only the
**code-owned** gates, which are literals in `lib/payload/content-map.ts`:

- P2/P3 rubrique routes → closed (a CMS record could never open a tier);
- `/domaines-activite/{slug}` → closed for a code-gated domain or an unknown
  slug (the five slugs are a code-owned enum), open (render-side) otherwise;
- `/realisations/{slug}` → closed while `caseStudiesLive` is false;
- P1 page routes (and legal utilities) → `unknown`, resolved by the render-side
  guards (`requirePublishedRubrique` / `requirePublishedDomain`) because their
  publish state lives in the database.

This split means every code-gated route gets the same real, server-rendered
branded 404 in both providers — which is what makes the fixture-vs-CMS parity
comparison possible — while the proxy never queries Postgres.

Trade-off (unchanged from #29, documented): a P1 page or domain the owner
**unpublishes** answers 404 through the render boundary. The status is correct;
the document for that case is Next's client-hydrated not-found shell rather than
the pre-rendered 404 page. Revalidation (#30) makes the change visible
immediately; making the rendered body identical for CMS-unpublished routes
would need a database lookup in the proxy or a second gate, both rejected.

---

## 12. Verification

```bash
# the merge gate — database-free, fixture content source (6 scenarios)
rm -rf .next && npm run typecheck && npm run lint && TEST_HTTP_PORT=3130 npm test

# the CMS acceptance check — disposable Postgres, parity included
npm run test:cms
```

`npm run test:cms` (`scripts/test-cms.mjs`) uses container `hay2010-pg-30` on
port **5530**, the fixture server on **3129** and the CMS server on **3130**. It:

1. applies the committed migrations from empty, checks `migrate:status` and
   re-runs `migrate` (no-op);
2. seeds, then seeds again and asserts the second run is a no-op;
3. builds the fixture `p1` production app, serves it and captures the P1 route
   matrix (`scripts/parity.mjs`);
4. builds the CMS production app, serves it and captures the same matrix, then
   compares them — statuses, `<html lang>`, `<title>`, meta description, the
   heading sequence, normalised `<main>` text/links, header/footer links and the
   sitemap. Any difference fails the run, with a per-route diff;
5. runs `tests/cms/**` through Vitest against the CMS server;
6. removes the container, the uploads, the servers and (on success) the builds.
   On failure it keeps `.next` (including `.next/parity/*.json`) for debugging.

### Parity evidence (#30)

The parity phase asserts the launch state on the P1 route matrix: 18 routes —
11 published (homepage, À propos, domain index, the three published domains,
Réalisations, Contact, Carrières, both legal pages) and 7 gated (the two gated
domains, the two P2 rubriques, Actualités, the named-case-study route and an
unknown route) — plus the sitemap (11 URLs). The fixture and CMS documents are
normalised and compared field by field.

### `tests/cms/` assertions (HTTP unless noted)

| Assertion | Expected |
| --- | --- |
| `GET /admin`, `GET /admin/login` | 200, same origin, `lang="fr"`, French login title |
| authenticated dashboard (JWT) | gate panel with P2/P3 reasons, code-owned constants panel |
| anonymous `GET /api/users`, any anonymous write | 403 |
| anonymous `GET /api/globals/homepage`, `/api/domaines`, `/api/media` | published corpus only (3 domains, cleared media only) |
| anonymous `GET /api/jobs` | empty at launch (every opening is a draft) |
| seeded P1 pages | 200 with the fixture copy (Accueil, À propos, domain index + 3 domains, Réalisations, Contact, Carrières, legal) |
| gated routes | 404 in both providers (2 domains, 2 P2 rubriques, Actualités, case-study family) |
| legal pages | 200, identity code-owned; no CMS global exists |
| owner edit page copy / domaine prestations → GET | new copy without a rebuild (revalidation) |
| owner unpublish → GET, then republish | 404, then 200; record kept |
| owner publish/close a job | appears/disappears on `/carrières` without a rebuild |
| owner delete a domain/media | 403 (developer delete works) |
| editor publish (collection + global) | 403; editor draft edit 200 |
| code-owned fields (`domaines.slug`, `jobs.applicationEmail`) | owner write dropped/rejected, stored value unchanged |
| owner creates a domain | 403 (structural change is developer-only) |
| unknown global field (`navLabel`, `legalIdentity`, `agrementLive`) | ignored (not modelled) |
| publish a page with a rights-pending image | 400 on the upload field |
| owner clears restricted media | refused; stored status unchanged |
| developer clears rights, owner publishes, then revokes | image renders, then disappears (revalidation) |
| publish a code-gated domain | CMS write succeeds, public route/index/sitemap stay closed |
| publish the `actualites` global | route stays 404 (`actualitesLive` false) |
| publish a communiqué without `legalReviewed` | 400; with review 200, route still 404 |
| publish a named case study without permissions | 400; with permissions 200, detail route still 404 |

Non-HTTP checks (`tests/cms/schema.test.ts`): no `localization` config at P1; the
committed migration creates every table and keeps `_objectkey`; the code-owned
content map matches the rubrique registry (tiers/labels); the seed reads the
fixture files and uses no raw SQL. Plus the pure object-storage unit checks
(`storage-config.test.ts`).

---

## 13. Known limitations (#30)

- Postgres 17 and real R2 upload/delete are documented but not verified locally
  (16-alpine and the local-disk fallback are).
- Draft preview and signed preview URLs are not implemented (handover note for
  #34); the admin edits drafts, it does not render them publicly.
- The owner-unpublished P1 route returns Next's client-hydrated not-found shell
  (status 404; see §11 trade-off).
- `seo.title`/`seo.ogImage` are stored but not rendered until #32's metadata
  system; at P1 the page title and the code-owned defaults drive the head.
- The admin has no 2FA and no login rate limiting in the codebase; #31 puts the
  staging host behind the access layer, and #34 documents account ownership.
- `homepage.referencesTeaser.featuredProjects` is not modelled: no project is
  published at P1 and the teaser always renders the “Références sur demande”
  fallback, matching ticket #24.
- The mediatheque global (content model §5.1) is not modelled at P1: there is
  no route and no approved photo, so nothing could render it.
