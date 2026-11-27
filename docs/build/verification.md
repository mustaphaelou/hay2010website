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
(`p1`, `p2`, `p3`, `p1-gates-closed`, `p1-recrutement`, `p1-hero-image`):

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
| `p1` | 5 rubriques, 3 domains, Carrières and the legal utility pages published | launch state: open routes 200, gated routes/domains 404, sitemap = published set; Carrières empty state, F-113 closed (questions to `contact@`, no CV invitation). The legal pages are P1 pages (#28) so the contact and careers notices can link the privacy policy |
| `p2` | 7 rubriques, 5 domains | tier composition (Moyens + Références inserted), opening the two gated domains makes their routes 200; owner-published openings render while F-113 stays closed |
| `p3` | 8 rubriques | Actualités inserted; published-but-unbuilt page stays out of the sitemap |
| `p1-gates-closed` | P1 minus À propos and Éclairage public | closing a gate removes it from every surface and makes its existing route 404; Carrières stays open with its empty state |
| `p1-recrutement` | P1 plus the F-113 channel live | the careers mailbox is published, CVs are invited by e-mail and the approved notice renders with a (fictitious) CNDP reference; never a production corpus |
| `p1-hero-image` | P1 launch state plus a cleared hero photograph in the corpus | the homepage image path (#23): the hero renders the supplied documentary image with explicit dimensions and alt, while `p1` proves the typographic fallback because no licensed photograph exists at launch |

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
- homepage shell: the one banner/main/contentinfo pair surrounds the homepage
  trame, with the page `h1` under the one `<main>`;
- published rubriques only: the header row follows the scenario's published set
  in CDC order; the footer links come from the same set; no undeclared or gated
  internal link;
- footer identity: badge, registered address, `contact@hay2010.ma`, legal line;
  no phone, social, newsletter or recruitment mailbox;
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

`tests/http/homepage.test.ts` (#23)

- the seven CDC sections render once each, in the decided order: hero → intro →
  domain blocks → repères → réalisations teaser → engagements → contact CTA,
  each section labelled by its own heading; one `h1`, the SEO query phrase;
- hero: the typographic ink fallback when the corpus carries no licensed image
  (no `img`/`picture`/`figure`/video, approved positioning line, CTAs to
  Réalisations and Contact); in the `p1-hero-image` corpus, exactly one supplied
  documentary image with French alt, intrinsic `width`/`height` (no layout
  shift) and no remote/stock URL;
- domain blocks link exactly the scenario's published domain pages in CDC order
  and never a gated domain or a non-domain route; the intro links À propos only
  while that gate is open;
- repères: only the cleared facts (experience line, Rabat base, the four
  approved service words) — no invented counts, percentage, financial figure,
  ranking, certification or founding year, and no ONEE wording;
- réalisations teaser: `Références sur demande` fallback + approved supporting
  line, link to `/realisations`, no project cards, detail links or photography;
- engagements are text-only (qualité, sécurité, délais) with no equipment or
  certification claim; no careers teaser, no news teaser, no video band and no
  selected-project cards;
- the last section is the contact CTA, phrased as the decided question and
  linking only the published `/contact`;
- hero motion is guarded by `prefers-reduced-motion` (animation only under
  `no-preference`, disabled under `reduce`);
- unique title (the homepage `title.absolute`) and 120–160 character
  description, one apex canonical, unique against the other built pages; no
  form, analytics or consent surface; no placeholder copy.

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

`tests/http/a-propos.test.ts` (#25)

- the page serves a French document with one `h1`, the approved positioning
  line, the approved experience line and the exact gérant line;
- the required trame sections render once each, in the decided order:
  activité et périmètre → mission/vision/values → qualité/sécurité/conformité,
  each `h2` labelling its own section landmark;
- the four cleared launch services and the Rabat base render, with no national
  coverage claim;
- gated material is absent: no founding year or other history claim, no
  agrément/certification wording, no gated solaire domain, no team/org-chart or
  quote block, no photograph and no employee name (the gérant line is the only
  person named, exactly once);
- no link to `/references-et-partenaires` while that P2 rubrique is unpublished
  (the page keeps a documented extension point that renders the canonical link
  only when the rubrique is published _and_ has a page document);
- unique title and description across the scenario's published routes, within
  the SEO length bounds; no form, analytics, consent banner or tracking cookie;
  no placeholder copy.
  `tests/http/contact.test.ts` (#26)

- one canonical French document with one `h1` (`Contact`), served with 200;
- the primary action is the cleared mailbox as a bare `mailto:`; no other or
  private mailbox is linked;
- the registered address renders verbatim from the code-owned identity block
  (postal `<address>` markup);
- no gated channel leaks: no `tel:` link, phone, opening hours, map/iframe or
  social profile at P1 (facts register §2.3); clearing one is a content-data
  change (`ContactChannelsBlock`), not a renderer refactor;
- no form control, no browser storage hook, no analytics script or API marker,
  no tracking cookie, no consent banner, no `Set-Cookie`;
- the privacy policy is linked and the code-owned short law 09-08 notice is
  present, with **no** CNDP declaration while no receipt exists;
- the page states what is and is not collected, explains what to put in an
  email and what happens next (ordered steps);
- no gated claim (ONEE/agrément, founding year, client, RC/ICE), no invented
  response time or free-quote promise;
- metadata: unique French title and 120–170 character description, unique
  against the other built pages of the scenario.
  `tests/http/legal.test.ts` (#28)

- `/mentions-legales` carries the exact facts-register identity block and the
  approved §4.2 sections, with no publication director, host line, phone,
  representative or blank CNDP field;
- `/politique-de-confidentialite` carries the §4.3 copy: controller identity,
  processing register (2.1–2.6), recipients, transfers, the §5.3 retention
  table and the §5.4 rights procedure at `donnees@hay2010.ma`;
- cookies are §7 of the policy (anchor `#cookies`, launch-state table, no
  banner, no analytics paragraph) and there is no separate `/cookies` route;
- both pages render no form, banner, analytics or tracking cookie, declare a
  self-referencing canonical and unique title/description, and are linked from
  the footer of every published page and of the 404 document;
- the identity and approved copy are code-owned (`lib/legal/`), absent from the
  content corpus, and never read through the content seam.

`tests/http/realisations.test.ts` (#24)

- `/realisations` serves one canonical French document with one `h1` and
  substantive credentials copy, not an empty shell;
- it states the approved `Références sur demande.` wording and the exact
  fallback sentence, and the qualification block prints the honest code-owned
  position — with no ONEE/agrément/certification/« entreprise agréée » wording
  in any P1 scenario (the claim's `live` flag in `lib/site/claims.ts` is false
  while both certificates are missing);
- the service rows are exactly the scenario's published domains, each linking
  its live domain page; a gated domain is absent from the rows and their links;
- the page explains what a reference request covers (object/service, place and
  year, scope, contract or réception as evidence) and the permission rules that
  document a project once written authorisations exist;
- no catalogue surface: no form/filter/pagination control or vocabulary, no URL
  filter parameters, no card list (no nested `<article>`, no `<time>`), no
  image/media element, no client name, logo, quote, amount or procurement
  figure, no testimonial or « ils nous font confiance » band, no portfolio
  wording, no placeholder copy;
- the four-step method renders as an ordered list under `De l’étude à la
  réception`, and the contact CTA links `/contact` while the reference CTA is
  the exact `mailto:contact@hay2010.ma` with the decided subject;
- metadata: the decided unique title, the 120–170 character `agrementLive:
  false` description, one canonical apex URL without a slash, indexable, and no
  JSON-LD at all (`#32` owns structured data; no ItemList/CreativeWork/Review
  before three published projects); the title/description are unique against
  every other open route of the scenario;
- the gated named-case-study family: `/realisations/{slug}` serves the branded
  404 (same document as an unknown URL), never redirects, and appears in no
  navigation, footer, sitemap entry or internal link of the route matrix.

`tests/http/carrieres.test.ts` (#27)

- `/carrieres` serves a canonical French document with one `h1` (`Carrières`)
  and is linked from the footer of every published page, while never appearing
  in the desktop row or the drawer's primary navigation;
- openings render inline from the content source, in the decided order
  (`featured` first, then `postedAt` descending); a record past its closing date
  never renders and no card links into a `/carrieres/{slug}` detail route;
- the honest empty state renders when no role is open — never a placeholder;
- the F-113 email gate: until the CNDP authorization covers `recrutement@`,
  only `contact@` is published and the page never invites a CV, the spontaneous
  application section, a CNDP reference or a blank `n°`; once it opens, the
  careers mailbox, the CV-by-e-mail copy and the approved notice render with the
  real authorization number and date;
- no application form, input, upload, `JobPosting` structured data, phone,
  social profile, private mailbox or unverified claim renders anywhere on the
  page; metadata is the approved unique title/description for the current gate
  state.

`tests/http/seo.test.ts` (#32)

- every decided P1 route serves the approved `<title>` and 120–160 character
  description (SEO §3.3 adapted to the P1 routes); titles carry exactly one
  `— HAY2010` (homepage `title.absolute`, brand first) and are unique per
  scenario, as are descriptions;
- one absolute, apex, HTTPS, query-free, slash-free self-referencing canonical
  per page (homepage = the origin); full Open Graph/Twitter objects on every
  page (`fr_FR`, `og:site_name`, `summary_large_image`, 1200×630 image
  descriptor, no `twitter:site`/`creator`, no alternate locale);
- baseline head: `lang=fr`, index/follow + Googlebot hints, light scheme, paper
  theme colour, viewport-fit, format-detection off, no keywords/author/hreflang;
- the 404 document is noindex/nofollow with the French title and no canonical;
- no gated claim (ONEE/agrément/solaire/phone/old RC/figures/…) in the metadata
  of a published P1 page.

`tests/http/structured-data.test.ts` (#32)

- one native JSON-LD block per page, one parsed `@graph`, exactly one
  Organization and one WebPage node; WebSite only on the homepage (no
  `SearchAction`, no tagline);
- Organization carries only cleared facts (name, legal/alternate name, URL,
  `contact@`, registered seat, RC/ICE identifiers, four `knowsAbout`
  services); the WebPage subtype matches the page (`AboutPage`, `ContactPage`,
  `CollectionPage`, else `WebPage`), ids/url/name are stable and canonical;
- the type whitelist and the gated-type/gated-property denylists hold
  (`LocalBusiness`, `JobPosting`, `BreadcrumbList`, `Review`, `Service`,
  `Article`, `sameAs`, `logo`, `telephone`, `foundingDate`, …), no gated URL or
  claim appears in a graph, and a 404 carries no structured data.

`tests/http/og-card.test.ts` (#32)

- the default share card is served over HTTP as a real 1200×630 PNG under
  300 KB, on the same origin; every published page uses it as `og:image` and
  `twitter:image` with width/height/type metas; the 404 publishes no card.

`tests/http/robots.test.ts` (#32)

- production `/robots.txt`: allow public, disallow `/admin`, `/api/`, `/preview/`,
  absolute sitemap line, never the staging disallow-all and never blocking
  `/_next/`, `/og/`, the sitemap or the legacy paths; no public response carries
  the staging `X-Robots-Tag`; the advertised sitemap is served. Staging's
  disallow-all/noindex behaviour is covered by `scripts/check-ops.mjs`, not by
  this production-mode suite.

`tests/http/sitemap.test.ts` (#32)

- exactly the published, built set of the scenario (derived through the seam),
  one `urlset`, absolute apex HTTPS URLs without slash/query, every entry is the
  canonical 200 page it claims; no gated rubrique/domain, no
  `/realisations/{slug}` family, no `/en`/admin/API/preview/legacy or
  asset URL; no fake `lastmod`, `changefreq`, `priority` or image/video
  extension; crawlable (200, XML, no staging header, referenced by robots.txt).

`tests/http/legacy-urls.test.ts` (#32)

- table-driven SEO §7 map: every legacy equivalent (pages, service children,
  portfolio archive, sitemap files, file-path slashes) is a single-hop 301 to
  its decided new route, whose target returns 200; the old shortlink/search
  queries 301 to the homepage with the query dropped; demo posts/archives,
  portfolio records, members, taxonomies, author, feeds, WooCommerce, WP assets,
  the sitemap stylesheet, filler page, pagination, search and `/blog/` are 410
  (no `Location`, noindex, minimal French HTML with a home link and no
  canonical); the other WP query parameters are 410 while tracking parameters
  render 200; case variants 301; every trailing-slash variant normalises
  permanently to the no-slash URL (gated routes still end on 404); no redirect
  target is gated or on `/en`/`/admin`/`/api`/`/preview`; `/api/health` and
  `/admin` are not intercepted; WP internals are 404.

`tests/architecture.test.ts` (structural guards, not HTTP)

- no file outside `lib/content/providers/` imports Payload — the CMS stays
  behind the adapter (#29 must keep this);
- only `lib/content/` imports a provider directly — rendering code goes through
  `getContentSource()`;
- every frontend page calls its `requirePublishedRubrique()` /
  `requirePublishedDomain()` / `requirePublishedCaseStudy()` guard first;
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
| `tests/http/homepage.test.ts` | #23 homepage trame, hero states, cleared facts, exclusive teasers, motion guard, unique metadata |
| `tests/http/navigation.test.ts` | registry-driven nav, drawer, footer |
| `tests/http/gates.test.ts` | publication gates, internal-link and sitemap leaks |
| `tests/http/not-found.test.ts` | real 404 status/document/links back |
| `tests/http/en-reserved.test.ts` | `/en` reserved, French prefix-free |
| `tests/http/a-propos.test.ts` | #25 institutional trame, gated claims, unique metadata |
| `tests/http/domaines.test.ts` | #22 domain index, CDC trame pages, DEV-006 omissions, gated-domain/claim absence, unique metadata |
| `tests/http/legal.test.ts` | #28 legal pages: code-owned identity/copy, cookies, retention, rights, footer links, metadata |
| `tests/http/realisations.test.ts` | #24 credentials-led références page, qualification claim gate, no catalogue/client evidence, gated case-study family 404 and absence |
| `tests/http/carrieres.test.ts` | #27 Carrières: footer-only reachability, inline openings, F-113 email gate, no form/`JobPosting`, unique metadata |
| `tests/http/seo.test.ts` | #32 canonical URL policy, approved titles/descriptions, uniqueness/bounds, OG/Twitter, head baseline, 404 metadata, gated-claim denylist |
| `tests/http/structured-data.test.ts` | #32 one JSON-LD `@graph`, Organization/WebSite/WebPage types and ids, cleared facts, gated-type/property denylists |
| `tests/http/og-card.test.ts` | #32 served 1200×630 PNG share card as the default `og:image`/`twitter:image` |
| `tests/http/robots.test.ts` | #32 production robots rules, staging posture absent in production, sitemap advertised/served |
| `tests/http/sitemap.test.ts` | #32 exact published sitemap set, canonical 200 per entry, gated-URL guards, no fake `lastmod` |
| `tests/http/legacy-urls.test.ts` | #32 table-driven 301/410/case/query/trailing-slash legacy WordPress map, no gated target, `/api`/`/admin` untouched |
| `tests/architecture.test.ts` | seam/layout/legal-ownership guards: no direct CMS import, no root `app/layout.tsx`, every page gated, legal copy code-owned |
| `scripts/generate-og-card.mjs` | #32 regenerates the committed typographic 1200×630 Open Graph card |

## Extending it (later tickets)

Extend this suite; do not add a second runner or component tests.

- **Page content** (#22–#28): add test files under `tests/http/` and assert the
  served trame (headings, blocks, links) for your routes; use
  `fetchPage`, `assertCanonicalDocument`, `textOf`. Import the expectations of
  `scenarios.ts` when the public shape changes.
- **New gated route families** (#24 and later): extend `resolveRouteGate()`
  (`lib/site/route-gate.ts`), add the route's render-side `requirePublished*()`
  guard, and add the closed paths to `gatedRoutes` in
  `tests/http/scenarios.ts`. #24's `/realisations/{slug}` family is the worked
  example: a code-owned `CASE_STUDIES_LIVE` gate, a route that calls
  `requirePublishedCaseStudy()` first, and `GATED_CASE_STUDY_ROUTES` asserted in
  every scenario.
- **New scenario**: JSON file + provider map + `SCENARIOS` in the orchestrator +
  expectations block.
- **Legacy redirects/410s** (#32): fetch with `redirect: "manual"` (already the
  default in `fetchPage`) and assert status and `location`, or use the
  terminal-response helper in `tests/http/legacy-urls.test.ts` when the generic
  trailing-slash normalisation may add one permanent hop.
- **Share card** (#32): `npm run og:generate` regenerates
  `public/og/hay2010-default.png` from `scripts/generate-og-card.mjs` and the
  committed Poppins TTFs; commit the result. The suite asserts the served bytes.
- Keep tests deterministic and self-cleaning: no CMS, no Postgres, no network at
  test time, no shared server outside the orchestrator. Fonts are fetched once
  at build time by `next/font` and self-hosted from then on, so visitors and
  tests never contact Google.
