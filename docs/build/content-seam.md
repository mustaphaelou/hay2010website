# The content seam — contract for every content ticket

Status: established by ticket #21. Read this before writing any page, navigation,
sitemap or metadata code in the P1 build.

The seam is the only door between rendering code and content. It exists so the
whole gate strategy is testable without a database, so the CMS (#29/#30) can
replace the fixture corpus without touching pages, and so a closed gate can
never leak through a surface nobody remembered to update.

```
proxy.ts ─┐
pages ────┼─→ lib/content/index.ts ─→ ContentSource ─→ fixture JSON corpus
header ───┤                               └───────────→ Payload CMS (#29, dynamic import)
drawer ───┤
footer ───┤
sitemap ──┤
404 page ─┘
```

No page, navigation, footer, sitemap or metadata file may import a provider or
the CMS directly. `lib/content/index.ts` is the only place that selects one.

---

## 1. The content source

`lib/content/index.ts`

```ts
getContentSource(): Promise<ContentSource>
getContentProviderName(): "fixture" | "cms"
```

| Env var          | Default   | Meaning                                        |
| ---------------- | --------- | ---------------------------------------------- |
| `CONTENT_SOURCE` | `fixture` | `fixture` (JSON corpus) or `cms` (#29).        |
| `CONTENT_SCENARIO` | `p1`    | Fixture gate scenario, see §3. Ignored by `cms`. |

The provider is resolved once per process. The CMS branch is a **dynamic
`import()`** (`providers/cms.ts`) so a fixture build/test never bundles Payload,
a database driver or `payload.config.ts`.

### `ContentSource` — `lib/content/types.ts`

| Method | Returns | Gate semantics |
| --- | --- | --- |
| `getPublishState(key)` | `{ published, reason? }` | The rubrique gate. `reason` is internal (admin #30), never rendered. |
| `listPublishedRubriques()` | `RubriqueKey[]` | **Published only.** Order is the provider's; the registry imposes CDC order. |
| `getPage(key)` | `PageDocument \| null` | A document may exist **while its gate is closed** (content complete, page hidden). |
| `listPublishedDomains()` | `DomainDocument[]` | Published only, CDC order. |
| `getDomain(slug)` | `DomainDocument \| null` | `null` for a closed **or unknown** slug — the route cannot leak a gated page. |
| `getActualites()` | `ActualiteDocument[]` | Published only; empty at P1. |
| `getOpenJobs()` | `JobOpening[]` | Published **and** still open (`status=open`, closing date absent/future), ordered `featured` first then `postedAt` descending (forms doc §4.2). Powers the inline `/carrieres` cards; no detail route exists. |
| `getCareersChannel()` | `CareersChannel` | The F-113 gate: `recruitmentMailboxLive` plus the real CNDP reference. Fails closed. Never CMS-editable (#30). |
| `getMedia(id)` | `MediaRecord \| null` | Only rights-cleared records leave the seam. |

Domain types are trame-oriented. The block union (`ContentBlock`) covers the
fixed trames: `hero`, `intro`, `presentation`, `prestations`, `methods`,
`photos`, `associees`, `domaines`, `reperes`, `engagements`, `credentials`,
`contact-cta`, `sections`, `openings`. **A block is optional**: a renderer omits
an absent block, it never fills a placeholder (DEV-006). Page tickets may add
block kinds, but must keep the existing ones working. The `openings` block
predates the jobs collection: jobs are content documents returned by
`getOpenJobs()` and rendered inline (below), not a page-document block.

`PageDocument` / `DomainDocument` carry `title` and `description` for the page
h1 and metadata; page tickets add the decided copy, #32 wires metadata.

---

## 2. Code-owned vs content-owned

| Code-owned (`lib/site/`) | Content-owned (`content/` today, CMS from #30) |
| --- | --- |
| Legal identity, claims, contact channels: `company.ts` | Page copy and blocks |
| Rubrique keys, CDC titles, nav labels, routes, tiers: `rubriques.ts` | Publish state per scenario (then per document in the CMS) |
| Domain route prefix: `domaines.ts` | Domain documents and their titles |
| Gate plumbing: `gates.ts`, `route-gate.ts` | Utility page copy |
| Careers channel gate, approved careers behaviour strings and metadata: `careers.ts` | Job opening records |
| Canonical origin (until #32): `site.ts` | Actualités documents |

Identity and navigation constants never become CMS-editable (content model §3).

---

## 3. Fixture corpus and scenarios

```
content/fixtures/
  site.json                  documents shared by every scenario
    pages:   { "<rubriqueKey>": { title?, description?, blocks: [] } }
    domains: [ { slug, title, description?, blocks: [] } ]   ← the five CDC domains
    actualites: []
    jobs: [ { slug, title, contractType, location, summary, status, postedAt?, closingAt? } ]
    media: []
  scenarios/
    p1.json                  launch state
    p2.json                  + Moyens, Références, all five domains
    p3.json                  + Actualités
    p1-gates-closed.json     P1 with À propos and Éclairage public closed
    p1-recrutement.json      + the F-113 careers mailbox live and openings published
```

A scenario is a **gate map**, not code:

```json
{
  "tier": "P1",
  "rubriques": { "accueil": { "published": true }, "a-propos": { "published": false, "reason": "…" } },
  "domains": { "eclairage-public": { "published": true } }
}
```

`CONTENT_SCENARIO` selects the file; `scripts/test-http.mjs` builds and starts
the production app once per scenario. Unknown scenario names throw at startup —
a gate test must never pass against the wrong corpus.

Scenarios are simulations: `p2`/`p3` open navigation entries before their page
routes ship. Pages are still expected to exist only when their ticket lands; the
sitemap excludes a published rubrique that has no page document, so the
simulation cannot emit a 404 URL.

### Add a page document (page tickets)

1. Add the route file `app/(frontend)/<route>/page.tsx` (see §7 for the first
   two lines).
2. Add `"<rubriqueKey>": { "title": … , "description": …, "blocks": [ … ] }` to
   `content/fixtures/site.json` with **decided copy only**.
3. The URL joins the sitemap automatically (published + document present).
4. Add your HTTP tests under `tests/http/` and extend
   `tests/http/scenarios.ts` if the scenario's public shape changes.

### Add a domain

Domains are content documents, never navigation entries: add the object to
`site.json` and its publish state to each scenario. `listPublishedDomains()`
and the sitemap pick it up; the `[slug]` route already exists.

### Add a scenario

1. `content/fixtures/scenarios/<name>.json` (copy `p1.json`, change gates).
2. Register the name in `lib/content/providers/fixture.ts` (`SCENARIOS` map) and
   add its expectation block in `tests/http/scenarios.ts`.
3. Add the name to `SCENARIOS` in `scripts/test-http.mjs`.

### Change a gate

Edit the scenario JSON. Nothing else: nav, drawer, footer, internal links,
sitemap and the gated route all follow. For a single scenario, re-run
`TEST_HTTP_SCENARIO=<name> SKIP_BUILD=1 npm test` against a build made with that
scenario (the gate command builds every scenario itself).

---

## 4. The rubrique registry

`lib/site/rubriques.ts` — code-owned:

```ts
RUBRIQUES: readonly RubriqueEntry[]   // 8 CDC rubriques in CDC order + 3 utilities
getRubrique(key)
getPublishState(key)                  // through the seam
getPublishedRubriques()               // ordered, published only
getPublishedNavigation()              // inNavigation rubriques as NavigationItem[]
getPublishedUtilities()               // Carrières + legal, published only
```

Rows are derived, never hardcoded: the P1 row is five items, P2 adds `Moyens`
and `Références`, P3 adds `Actualités`. A gated entry disappears from every
surface at once because every surface calls one of these functions.

---

### Career openings and the F-113 channel (#27)

`/carrieres` is a footer-only utility page. Two extra pieces of state come
through the seam, never from a page branch:

- **Job openings** are content documents (`site.json` → `jobs`, the CMS `jobs`
  collection from #30). A record renders when its publish gate is open and it
  is still open (status open, closing date absent or in the future); the
  provider filters and orders them (`featured` first, then `postedAt`
  descending) and the page renders them inline. There is **no** detail route
  and no `JobPosting` data at launch (forms doc §4.8).
- **The careers application channel** is the F-113 gate (forms doc §4.4):
  `contact@hay2010.ma` for questions until the CNDP authorization covers
  `recrutement@hay2010.ma`. `getCareersChannel()` exposes
  `{ recruitmentMailboxLive, authorization? }`; the page renders the
  questions-only state unless the flag is true **and** a real authorization
  number/date is present — and then the approved notice with that reference,
  never a blank `n°` (§4.9). The switch is data: a fixture scenario field
  (`"careers": { recruitmentMailboxLive, authorization }`) today, code-owned
  deployment configuration in the CMS provider (#29/#30) — the admin can never
  open it (content model §3/§5.1). The `p1-recrutement` scenario simulates the
  open state with a deliberately fictitious reference.

## 5. Gate semantics — two layers

**Gated means**: absent from desktop nav, drawer, footer, sitemap and every
derived internal link, and its route returns **404** — not a redirect, not a
200 shell, not a placeholder. Gate state is resolved from content, never from
the file tree.

### Layer 1 — `proxy.ts` (the observable 404)

`proxy.ts` (Next 16's renamed middleware) calls
`resolveRouteGate(pathname)` (`lib/site/route-gate.ts`) before rendering:

- exact rubrique route → its publish state;
- `/domaines-activite/{slug}` → domain publish state (closed **and unknown**
  slugs behave identically);
- anything else → `unknown` (router 404 / page guard handles it).

A closed route is **rewritten to `/_not-found`**, which serves
`app/global-not-found.tsx` with a real **404 status** and the real page.

Why a proxy instead of only `notFound()`: in Next 16.4.x, a page-level
`notFound()` call responds `404` but its HTML body is an RSC bootstrap shell
(`<html id="__next_error__">`) — the not-found UI is only rendered client-side.
That is not acceptable for a "real branded 404, no hollow shell": crawlers and
the HTTP seam see an empty document, and a JavaScript-less visitor sees nothing.
The proxy rewrite gives the fully server-rendered document. Verified by the gate
suite: remove `proxy.ts` and three gate tests fail.

### Layer 2 — `requirePublishedRubrique()` / `requirePublishedDomain()`

`lib/site/gates.ts` — **every page file must call its guard as the first line**:

```tsx
export default async function Page() {
  await requirePublishedRubrique("a-propos")
  return <AProposPage />
}
```

```tsx
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const domain = await requirePublishedDomain(slug)
  return <DomainPage domain={domain} />
}
```

The guard interrupts with `notFound()` when the gate is closed. It is the
render half of the contract: it makes the statically prerendered artifact of a
closed route a 404 as well, and protects any transport that bypasses the proxy.
It never renders hollow content.

### Adding a gated dynamic route family

When a ticket adds a gated dynamic route (e.g. `/realisations/{slug}` in #24),
extend `resolveRouteGate()` so the family gets the server-rendered 404 too, and
add its closed paths to the matching scenario expectation in
`tests/http/scenarios.ts`.

---

## 6. Layout and the 404 document

The app deliberately has **no `app/layout.tsx`**:

```
app/
  (frontend)/
    layout.tsx          ← site root layout: <html lang="fr">, fonts, chrome
    page.tsx            ← /
    a-propos/…  domaines-activite/…  realisations/…  contact/…
    prototype/homepage/… (kept, noindex)
    sitemap.ts
  (payload)/            ← #29: Payload admin root layout
  global-not-found.tsx  ← full 404 document
  favicon.ico
proxy.ts
```

Each root route group owns its `<html>`/`<body>`. #29 adds
`app/(payload)/layout.tsx` next to `(frontend)`; nothing in `(frontend)`
changes. **Do not add `app/layout.tsx`** — it would break the Payload admin's
root layout.

Because there is no root layout, Next cannot compose a global 404 from one
layout. `next.config.ts` enables `experimental.globalNotFound` and
`app/global-not-found.tsx` renders the complete document (own
`<html lang="fr">`, `globals.css`, Poppins, header, footer): it reuses the same
shell components, so the 404 is a branded page rather than a hollow shell. Its
links back come from `getPublishedNavigation()` — a gated rubrique never
appears there.

---

## 7. Navigation surfaces

- `components/site/site-header.tsx` (server) reads the published set and passes
  it to `site-navigation.tsx` (client).
- `site-navigation.tsx` is the one navigation component: desktop row ≥1024 px,
  burger below, native modal `<dialog>` drawer. Accessibility contract:
  `aria-current="page"` on the current section (domain children mark their
  parent), `aria-expanded`/`aria-controls` on the trigger, native `showModal()`
  focus trap, Escape, body scroll lock, focus returned to the trigger, closed
  drawer display:none (inert), `<noscript>` fallback for the mobile drawer.
  It has no animation, so reduced-motion needs no special case.
- `components/site/site-footer.tsx` (server): four columns — identity,
  published rubriques, published utilities (column omitted while empty), siège
  + contact. Same published set, so gates cannot diverge.
- `app/(frontend)/sitemap.ts`: published rubriques **with a page document**
  (i.e. built) + published domains, absolute `https://hay2010.ma` URLs, no
  trailing slash. #32 takes over `lastModified`/robots policy via `lib/site/site.ts`.
- 404 links: see §6.

Interactive drawer behaviour (focus trap, Escape, scroll lock) is implemented in
the client component but not executable in the browser-free HTTP suite; #33's
keyboard pass validates it in a real browser. The suite asserts every
structural affordance (element types, ARIA wiring, closed state, mirrored
links).

---

## 8. `/en` reserved

French is prefix-free at the root; there is no `[lang]` segment, no i18n
library and no hreflang. `/en` currently returns the 404 document with a 404
status and never redirects. P2 adds English without moving French URLs:

1. `app/en/layout.tsx` + `app/en/page.tsx` (a **sibling root layout group path**
   under `app/en`, English `<html lang="en">`), sharing the seam;
2. localisable content fields (the CMS model already reserves them);
3. flip the `/en` expectation in `tests/http/en-reserved.test.ts` from 404 to
   200, add hreflang + alternates in #32's metadata layer.

---

## 9. How #29 plugs the CMS provider in

1. Implement `lib/content/providers/cms.ts`: `getCmsContentSource()` returns a
   `ContentSource` bound to Payload's local API. Import Payload only there
   (`payload.config`, `getPayload`) — dynamically, as the provider is already
   dynamically imported by `lib/content/index.ts`.
2. Translate Payload documents into the block union of `types.ts`. Keep gate
   application in the provider: published listings only, `getDomain` returns
   `null` when closed, `getPage` still returns closed documents, media only when
   rights are cleared.
3. Wire `getPublishState` to the CMS publish state (published/draft + tier gate).
   Tier gates stay code-owned: the admin cannot open a P2/P3 tier gate (#30).
4. Build with `CONTENT_SOURCE=cms` and the database reachable: pages are
   statically prerendered from the CMS at build (the deployment pipeline from
   #31 runs `payload migrate && next build`). Call `revalidatePath` /
   `revalidateTag` from publish hooks so edits appear without a rebuild (#30).
5. Keep `CONTENT_SOURCE=fixture` the default everywhere else: `npm test` and
   the build gate must never need Postgres.
6. `proxy.ts` gate lookups run per request. Keep the CMS gate lookup cheap
   (indexed field, single query) or, if that is not acceptable, return
   `unknown` for CMS-backed routes from `resolveRouteGate` and rely on layer 2
   (status 404, client-rendered not-found shell) — document the trade-off in
   #29's report. The fixture path is unaffected.
7. Code-owned constants (`lib/site/`) never come from the CMS; the CMS stores
   prose and images only.

## 10. How #30 extends content

- Add Payload content types/globals and a seed that reproduces the fixture
  corpus (`site.json` + scenario `p1` gates) so fixture-vs-CMS parity (#33) can
  compare the same route matrix.
- Map new CMS fields onto the existing block union; if a genuinely new block is
  needed, add it to `ContentBlock` **and** to the renderer in the same change.
- Publish/unpublish (never delete) feeds `getPublishState`; a closed page keeps
  its document and its gate reason (admin-visible).
- Media rights: only `rightsStatus: cleared` records leave the seam.

---

## 11. Environment summary

| Variable | Values | Used by |
| --- | --- | --- |
| `CONTENT_SOURCE` | `fixture` (default), `cms` | `lib/content/index.ts` |
| `CONTENT_SCENARIO` | `p1` (default), `p2`, `p3`, `p1-gates-closed` | fixture provider, `scripts/test-http.mjs` |
| `DATABASE_URL`, `PAYLOAD_SECRET` | #29 only | CMS provider |
| `TEST_HTTP_PORT` | `31NN` per ticket | HTTP orchestrator |
| `TEST_HTTP_SCENARIO`, `TEST_HTTP_BASE_URL` | set by the orchestrator | tests |

---

## 12. Verification

```bash
npm run typecheck && npm run lint && TEST_HTTP_PORT=3121 npm test
```

`npm test` builds the production app once per fixture scenario and runs the
whole HTTP suite against each build: `tests/http/{shell,navigation,gates,
not-found,en-reserved,carrieres}.test.ts`. See `docs/build/verification.md` for
what each group proves and the negative checks that keep the suite honest.
