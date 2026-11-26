# Verification — the HTTP test suite

The single verification seam for the site: one command builds the production
app, serves it, and checks what a visitor or a crawler actually receives. No
component tests, no second runner, no browser.

## The one command

```bash
TEST_HTTP_PORT=3120 npm test
```

From a clean checkout (no `node_modules`, no `.next`):

```bash
npm ci
TEST_HTTP_PORT=3120 npm test
```

`TEST_HTTP_PORT` is required for parallel work: each worktree uses its own
port (`31NN`), never 3000. Without it the runner defaults to 3100.

### What the command does

`scripts/test-http.mjs` runs the suite once **per fixture scenario**
(`p1`, `p2`, `p3`, `p1-gates-closed`):

1. removes `.next` and runs `next build` with
   `CONTENT_SOURCE=fixture CONTENT_SCENARIO=<scenario>` — the build is the
   production artefact, and the scenario is baked into the static prerender
   (navigation, gate routes, sitemap, 404 links) exactly like a deploy bakes the
   CMS content;
2. refuses to start if the port already answers HTTP (never test an unknown
   server);
3. starts the production server with `next start` on
   `127.0.0.1:$TEST_HTTP_PORT` and the same environment;
4. polls `/` until the server answers (60 s cap) and fails with the captured
   server stderr if it will not start;
5. runs `vitest run --config vitest.config.ts` with
   `TEST_HTTP_BASE_URL=http://127.0.0.1:$TEST_HTTP_PORT` and
   `TEST_HTTP_SCENARIO=<scenario>`;
6. always stops the server (SIGTERM, SIGKILL after 5 s), then moves to the next
   scenario;
7. exits with the first failing scenario's status.

`SKIP_BUILD=1` reuses the existing `.next` and runs a single scenario
(`TEST_HTTP_SCENARIO`, default `p1`) — for fast iteration only, never the gate.

The build is the production build: what the suite asserts is the artefact that
deploys, not a dev-server rendering. Each scenario group is a separate build of
that artefact, so the assertions never depend on runtime-only flags.

## Merge gate

Every ticket merges only when the following passes from its worktree:

```bash
npm run typecheck && npm run lint && npm test
```

The suite must pass from an empty `.next`; `npm test` builds it itself.

## Scenarios

`content/fixtures/scenarios/<name>.json` is a gate map (which rubriques and
domains are open), not code. `tests/http/scenarios.ts` holds the matching
expectations derived from the decided documents (IA, CDC tiers, SEO sitemap
rule) — so fixture data and the spec cannot drift silently.

| Scenario | Public shape | What it proves |
| --- | --- | --- |
| `p1` | 5 rubriques, 3 domains, no utility page | launch state: open routes 200, gated routes/domains 404, sitemap = published set |
| `p2` | 7 rubriques, 5 domains | tier composition (Moyens + Références inserted), opening the two gated domains makes their routes 200 |
| `p3` | 8 rubriques | Actualités inserted; published-but-unbuilt page stays out of the sitemap |
| `p1-gates-closed` | P1 minus À propos and Éclairage public | closing a gate removes it from every surface and makes its existing route 404 |

The same test bodies run in every scenario, so a gate is always observed from
both sides: `p1` asserts `/a-propos` 200 and present; `p1-gates-closed` asserts
404 and absent.

## What the suites assert

All suites read the served document only (status, headers, HTML). They never
import a component and never assert class names or call order.

`tests/http/shell.test.ts` (#20, extended by #21)

- canonical document: `lang="fr"`, one `<header>` banner, one `<main>`
  (`#contenu`, focusable) and one `<footer>` contentinfo, skip link first;
- French metadata: HAY2010 title and the approved positioning description,
  within the SEO length bounds;
- empty homepage: the shell renders around an empty `<main>` (homepage sections
  are #23);
- published rubriques only: the header row follows the scenario's published set
  in CDC order; the footer links come from the same set; no undeclared or gated
  internal link;
- footer identity: badge, registered address, `contact@hay2010.ma`, legal line;
  no phone, social, newsletter or recruitment mailbox;
- prototype route still served and `noindex`;
- privacy surface: no form control, no analytics script or API marker, no
  consent banner, no tracking cookie in `Set-Cookie`;
- brand styling: palette tokens, shadcn semantic mapping, self-hosted Poppins
  preloaded and embedded, visible keyboard focus (2 px ring, 2 px offset),
  reduced-motion protection, light theme only.

`tests/http/navigation.test.ts` (#21)

- desktop row = exactly the scenario's items in CDC order, flat (no dropdown
  triggers, no nested list);
- `aria-current="page"` on exactly the current section for an inner page
  (domain children mark their parent section);
- drawer: native `<dialog>`, button trigger with `aria-expanded="false"` and
  `aria-controls` pointing at the dialog, closed by default (inert), a close
  button, the same items as the row, the cleared mailto — and no gated link;
- footer links = published navigation + utilities;
- no gated URL in any link rendered by the route matrix or the 404 page.

`tests/http/gates.test.ts` (#21)

- every open rubrique/domain route returns 200 and a canonical document;
- every closed route returns **the same** 404 document as an unknown URL (same
  heading, nav, main links, footer links) with status 404 — not a redirect and
  not a hollow shell;
- the sitemap lists exactly the published, built set (absolute apex URLs) and
  never a gated or unbuilt route, `/en` or `/admin`;
- closed entries are absent from desktop nav, drawer, footer and document
  links; closing a domain also 404s its route.

`tests/http/not-found.test.ts` (#21)

- unknown URL: 404 status, French document, one canonical shell, `noindex`;
- links back to every published main rubrique (derived from the registry);
- no gated rubrique suggested.

`tests/http/domaines.test.ts` (#22)

- the index serves a canonical document and links exactly the published domains
  in CDC order; a gated domain is absent from the list, the links and the copy;
- each published domain page renders the CDC trame in order (presentation and
  needs → prestations → methods/means/competences → contact CTA), with named
  prestations and CFO/CFA / postes de transformation in their own domain;
- the photo and associated-réalisations blocks are absent, not placeholders;
- no ONEE agrément wording on any published page while the certificate gate is
  closed, and no Solaire vocabulary while the P2 domains are gated;
- the index and the three domain pages each carry a unique title, description
  and canonical apex URL without a trailing slash.

`tests/http/en-reserved.test.ts` (#21)

- `/en` returns 404 (no redirect, no route);
- French routes stay prefix-free (`/fr` 404, `/` 200);
- no hreflang alternates and no English document language at P1.

`tests/architecture.test.ts` (structural guards, not HTTP)

- no file outside `lib/content/providers/` imports Payload — the CMS stays
  behind the adapter (#29 must keep this);
- only `lib/content/` imports a provider directly — rendering code goes through
  `getContentSource()`;
- every frontend page calls `requirePublishedRubrique()` /
  `requirePublishedDomain()`;
- there is no root `app/layout.tsx` (the embedded Payload admin needs its own
  root layout) and `app/global-not-found.tsx` exists.

## Gate semantics and why there is a `proxy.ts`

A gated route returns the branded 404 page with a 404 status. In Next 16.4.x a
page-level `notFound()` responds 404 but its HTML body is an RSC bootstrap shell
(the UI is rendered client-side), which is not a real 404 document for a
crawler or a no-JS visitor. `proxy.ts` therefore rewrites closed routes to
`/_not-found` (the `global-not-found` document) before rendering; page files
keep `requirePublishedRubrique()` / `requirePublishedDomain()` as the render
guard. See `docs/build/content-seam.md` §5.

Two negative checks keep this honest (run manually when touching the gate):

- remove `proxy.ts`, rebuild `p1-gates-closed`, run the suite → the three gate
  tests fail because closed routes stop serving the real 404 page;
- delete a published item from `getPublishedNavigation()` output (or close a
  gate in the fixture) → nav/footer/sitemap assertions fail.

## What the suite cannot see (browser-only)

The drawer's focus trap, Escape handling, scroll lock and focus return are
implemented with the native `<dialog>` element and verified structurally
(element types, ARIA wiring, closed/inert state, mirrored links). Executing
them requires a browser; #33's keyboard pass validates the interactive
behaviour on the built site. No visual regression or e2e tool is added
preemptively (spec: "Deferred").

## Files

| File | Role |
| --- | --- |
| `scripts/test-http.mjs` | build → serve → test → clean up, once per scenario |
| `vitest.config.ts` | node environment, `tests/**/*.test.ts`, 20 s timeouts |
| `tests/http/helpers.ts` | fetch + parse + canonical-document/404/sitemap assertions |
| `tests/http/scenarios.ts` | spec-derived expected public shape per scenario |
| `tests/http/surfaces.ts` | link/nav/drawer/footer assertions |
| `tests/http/shell.test.ts` | #20 shell acceptance (scenario-aware) |
| `tests/http/navigation.test.ts` | registry-driven nav, drawer, footer |
| `tests/http/gates.test.ts` | publication gates, internal-link and sitemap leaks |
| `tests/http/not-found.test.ts` | real 404 status/document/links back |
| `tests/http/en-reserved.test.ts` | `/en` reserved, French prefix-free |
| `tests/http/domaines.test.ts` | #22 domain index, CDC trame pages, DEV-006 omissions, gated-domain/claim absence, unique metadata |
| `tests/architecture.test.ts` | seam/layout guards: no direct CMS import, no root `app/layout.tsx`, every page gated |

## Extending it (later tickets)

Extend this suite; do not add a second runner or component tests.

- **Page content** (#22–#28): add test files under `tests/http/` and assert the
  served trame (headings, blocks, links) for your routes; use
  `fetchPage`, `assertCanonicalDocument`, `textOf`. Import the expectations of
  `scenarios.ts` when the public shape changes.
- **New gated route families** (#24 and later): extend `resolveRouteGate()`
  (`lib/site/route-gate.ts`) and the `gatedRoutes`/`openRoutes` lists in
  `tests/http/scenarios.ts`.
- **New scenario**: JSON file + provider map + `SCENARIOS` in the orchestrator +
  expectations block.
- **Legacy redirects/410s** (#32): fetch with `redirect: "manual"` (already the
  default in `fetchPage`) and assert status and `location`.
- Keep tests deterministic and self-cleaning: no CMS, no Postgres, no network at
  test time, no shared server outside the orchestrator. Fonts are fetched once
  at build time by `next/font` and self-hosted from then on, so visitors and
  tests never contact Google.
