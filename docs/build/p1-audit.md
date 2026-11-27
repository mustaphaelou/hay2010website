# P1 audit — content parity, keyboard, motion, breakpoints, performance, claims

Status: **ticket [#33](https://github.com/mustaphaelou/hay2010website/issues/33)
verification evidence**, run against the merged P1 tree.
Audited commit: **`aaf6244`** (integration tip merged into
`feat/ticket-33-verification`; this report and its evidence are the next
commit — no application code changes after the audited tree).

| Item | Value |
| --- | --- |
| Date of audit runs | 2026-11-26 22:31 → 2026-11-27 (Africa/Casablanca) |
| Environment | WSL2, AMD Ryzen 5 PRO 7530U (12 logical CPUs), ~7 GB RAM, Node v26.13.1, npm 11.20.0 |
| Production build | Next.js 16.4.6 (App Router, `next build` + `next start`) |
| Browser | Playwright cached Chromium 1255 — Chrome for Testing **159.0.8154.6** |
| Audit tools | `playwright-core@1.65.1` (exact pin), `axe-core@4.14.1`, `lighthouse@13.6.0` via `npx` (not a repo dependency) |
| Ports | site `3133`; Chromium DevTools `9133`; CMS fixture `3129`; CMS `3130`; disposable Postgres `5530` (`hay2010-pg-30`) |
| Scenario audited in the browser | fixture `p1` (the launch state) |

The audit is **not a second gate**. `npm test` remains the single HTTP suite
(Vitest) and stays browser-free; the browser/claims/perf work lives in
`scripts/audit/**` and is run explicitly. The existing HTTP suite was not
weakened: it is unchanged and green.

## 0. Merge gate — PASS (run on the committed branch tip)

Run from this worktree on the final committed tip of
`feat/ticket-33-verification`:

```bash
rm -rf .next && npm run typecheck && npm run lint && TEST_HTTP_PORT=3133 npm test
```

- `npm run typecheck` — PASS (no diagnostics);
- `npm run lint` — PASS (no errors/warnings);
- `TEST_HTTP_PORT=3133 npm test` — **PASS, all 6 scenario groups** (`p1`, `p2`,
  `p3`, `p1-gates-closed`, `p1-recrutement`, `p1-hero-image`), each from a clean
  `next build`: 20 test files per scenario, **199 passed / 1 skipped**
  (`p1-gates-closed`: 187 passed / 13 skipped), suite duration 7.8–8.9 s per
  scenario. The suite is unchanged and still browser- and database-free.

The committed tip differs from the audited commit only by this report, the
evidence files and `scripts/audit/lighthouse.mjs` (an audit tool that `npm test`
never loads); application and test code are identical to the audited tree.

Evidence files committed next to this report:

| File | Contents |
| --- | --- |
| [`p1-audit/audit-results.json`](./p1-audit/audit-results.json) | browser audit: served-HTML scans, keyboard pass, motion, CLS, breakpoints, axe, request audit, exact computed values |
| [`p1-audit/claims-results.json`](./p1-audit/claims-results.json) | per-scenario gate matrix + claims/privacy scans over the six fixture corpora |
| [`p1-audit/lighthouse-results.json`](./p1-audit/lighthouse-results.json) | 3 Lighthouse runs per published route (raw metrics, medians, spread), INP caveat and synthetic Event-Timing proxy |
| [`p1-audit/screens/`](./p1-audit/screens/) | 8 breakpoint screenshots (homepage + Réalisations × 4 widths) and 2 keyboard screenshots |
| `p1-audit/test-cms.log` | `npm run test:cms` output (migrations, seed idempotence, parity line, CMS suite) |

---

## 1. Route matrix and fixture-vs-CMS parity — PASS

**What is compared.** `scripts/parity.mjs` (ticket #30) captures the P1 route
matrix under the fixture corpus and under the embedded-Payload corpus, then
compares the observable public document field by field: HTTP status,
`<html lang>`, `<title>`, meta description, heading sequence, normalised
`<main>` text, `<main>` links, header/footer links and the sitemap URLs.
Whitespace, NBSP, attributes, class names, `_next/static/*` hashes and build
ids are normalised away — the comparison is about what a visitor and a crawler
receive. It also asserts the expected launch status per route, so it cannot
pass by both providers serving the same wrong status.

`scripts/test-cms.mjs` drives it (`npm run test:cms`): disposable
`postgres:16-alpine` on port 5530, `payload migrate` from empty + re-run
(no-op), `payload seed` + re-run (idempotent, reports existing records),
fixture production build → capture → CMS production build → capture → compare,
then `tests/cms/**` against the CMS server, then cleanup of container, uploads
and builds.

**Evidence (this run):**

```
[cms-test] parity OK — 18 routes (11 published, 7 gated), 11 sitemap URLs identical under both providers
[cms-test] running tests/cms against http://127.0.0.1:3130
 ✓ tests/cms/cms.test.ts (28 tests) 7162ms
 ✓ tests/cms/schema.test.ts (5 tests) 16ms
 ✓ tests/cms/storage-config.test.ts (2 tests) 35 tests passed (35)
[cms-test] CMS verification passed — parity, HTTP suite, disposable container and uploads removed
```

- The P1 matrix is 18 routes: 11 published (homepage, À propos, domain index,
  the three published domains, Réalisations, Contact, Carrières, both legal
  pages) + 7 gated (two gated domains, the two P2 rubriques, Actualités, the
  named-case-study route, an unknown route). **0 differences.**
- "Same suppressed claims" follows from the comparison itself: the normalised
  `<main>` text, headings, metadata and JSON-LD-bearing head are identical under
  both providers, so any gated claim present under one would differ under the
  other. Independently, §7 confirms the launch corpus contains **zero** gated
  claims.
- Limitation (same as #30, unchanged): an owner-unpublished P1 route in CMS mode
  answers 404 through the render boundary with Next's fallback document rather
  than the pre-rendered branded 404. The parity matrix only covers the launch
  state, where nothing is unpublished.
- **Observed flake (not #33, reported):** one earlier run of the same command
  failed 1/35 CMS tests — `tests/cms/cms.test.ts` "publishes the image once the
  developer records the permission" fetched `/` before the revalidation hook had
  propagated, so the cached HTML did not yet contain the media filename. The
  parity phase passed in that run too, and an immediate rerun passed 35/35 (the
  log committed here is the clean run). This is a race in ticket #30's CMS test,
  not a product regression; follow-up: make that assertion poll/retry the GET or
  await the revalidation, rather than asserting on the first response.

## 2. Keyboard-only pass — PASS

Run on the production build at 360×800 (`playwright-core`, real key events; all
values in `audit-results.json` → `a11y.keyboard`).

| Check | Result |
| --- | --- |
| First `Tab` focuses the skip link | `a href="#contenu"`, text « Aller au contenu », `:focus-visible` = true, computed ring `outline: solid 3px` — [screenshot](./p1-audit/screens/keyboard-skip-link-focus-360.png) |
| `Enter` on the skip link moves focus to the main landmark | `document.activeElement` = `<main id="contenu">`, `location.hash = "#contenu"` |
| Tab order reaches the drawer trigger | Tab 1 skip link → Tab 2 logo link (« HAY2010 — accueil ») → Tab 3 button « Ouvrir le menu » (`aria-expanded="false"`, `aria-controls="menu-mobile"`), computed ring `outline: solid 2px` |
| `Enter` opens the drawer | native `<dialog>` `open` = true, `aria-expanded="true"`, focus moves inside the dialog, `body { overflow: hidden }` — [screenshot](./p1-audit/screens/keyboard-drawer-open-360.png) |
| Focus is trapped | 8 × `Tab` and 5 × `Shift+Tab` all keep `document.activeElement` inside `#menu-mobile` |
| `Escape` closes and returns focus | dialog `open` = false, `aria-expanded="false"`, focus is back on the trigger button, body overflow restored |
| `Space` also opens the trigger | dialog opens (native button activation) |
| `aria-current="page"` | `/domaines-activite/eclairage-public`: exactly one current link in the desktop row **and** in the drawer — « Domaines d’activité » → `/domaines-activite`; `/`: « Accueil » → `/` |
| No horizontal overflow at the keyboard viewport | `scrollWidth = clientWidth = 360` |

French accessible names are the real ones read from the #20/#21 shell (they are
recorded in the JSON, not hardcoded from the ticket text).

## 3. Reduced motion, layout stability and breakpoints — PASS

**Motion** (homepage, `audit-results.json` → `a11y.motion`):

| Context | `matchMedia('(prefers-reduced-motion: reduce)')` | `.accueil-hero-copy` animation | Computed values |
| --- | --- | --- | --- |
| `reducedMotion: "reduce"` | `true` | neutralised | `animationName: none`, `animationDuration: 1e-05s`, `getAnimations().length = 0`; a hover link's `transitionDuration: 1e-05s` |
| `reducedMotion: "no-preference"` (control) | `false` | present | `animationName: accueil-rise`, `animationDuration: 0.7s`, `getAnimations().length = 1`; hover link `transitionDuration: 0.15s` |

The control run matters: it proves motion exists in the first place, so the
reduce assertion is not vacuous. The brand §2.7 Ken Burns/rise rules are
declared only inside `@media (prefers-reduced-motion: no-preference)` and
switched off under `reduce` (verified by computed style, not just by reading
the stylesheet).

**CLS** (PerformanceObserver injected before navigation, 2.5 s after `load` on
every published route):

- 11/11 routes: **CLS = 0.0000**, **zero** layout-shift entries (not merely
  below budget).
- Screenshots are taken with `animations: "disabled"` and
  `reducedMotion: "reduce"`, so captures are deterministic.

**Breakpoints** — 360 / 768 / 1024 / 1440 px × 11 published routes = **44**
overflow assertions (`scrollWidth <= clientWidth`): **0 overflows**. Committed
screenshots (full page, committed under `docs/build/p1-audit/screens/`):

| Route | 360 | 768 | 1024 | 1440 |
| --- | --- | --- | --- | --- |
| `/` | [accueil-360](./p1-audit/screens/accueil-360.png) | [accueil-768](./p1-audit/screens/accueil-768.png) | [accueil-1024](./p1-audit/screens/accueil-1024.png) | [accueil-1440](./p1-audit/screens/accueil-1440.png) |
| `/realisations` | [realisations-360](./p1-audit/screens/realisations-360.png) | [realisations-768](./p1-audit/screens/realisations-768.png) | [realisations-1024](./p1-audit/screens/realisations-1024.png) | [realisations-1440](./p1-audit/screens/realisations-1440.png) |

**axe-core** (WCAG 2.0/2.1 A/AA tags, every published route, reduced motion so
fades cannot produce false contrast results): **269 passes, 0 violations**.
The 8 `incomplete` results are all the same `color-contrast` case — a single
`aria-hidden="true"` decorative `→` glyph inside a call to action; it is not
text content, and no other contrast node is incomplete.

**Audit-driven fix:** the axe scan initially found two serious
`scrollable-region-focusable` violations on
`/politique-de-confidentialite` — the retention and cookies tables scroll
horizontally below 34 rem and were not keyboard-reachable. Fixed in the audited
tree (`components/site/legal-document.tsx`: the scroll wrapper is now a named
`role="region"` with `tabIndex={0}`); the re-run reports 0 violations, and the
existing HTTP suite still passes unchanged.

## 4. Performance budgets (mobile 4G lab) — PASS on measurable lab budgets; INP not verifiable

**Method.** Lighthouse 13.6.0 attaches with `--port` to our own cached Chromium
(the WSL `chrome-launcher` trap in the tooling note) and runs against the
production build served on `127.0.0.1:3133`, with Lighthouse's default mobile
preset: `formFactor: mobile` (412×823, dpr 1.75), simulated 4G
(rtt 150 ms, throughput 1638 kbps, 4× CPU). **3 runs per route, median
reported**; spread is committed in the JSON. The host was idle (one Chromium,
one `next start`, no concurrent build) — TBT is noise-sensitive and the
committed run is the clean one (see "lab caveats" below).

| Route | Perf | A11y | LCP (ms) | CLS | TBT proxy (ms) | FCP (ms) | Bytes | LCP spread | TBT spread |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 99 | 100 | 768 | 0.000 | 104 | 768 | 269 KB | 172 ms | 61 ms |
| `/a-propos` | 99 | 100 | 764 | 0.000 | 97 | 764 | 252 KB | 1 ms | 9 ms |
| `/domaines-activite` | 99 | 100 | 767 | 0.000 | 95 | 767 | 260 KB | 3 ms | 22 ms |
| `/realisations` | 99 | 100 | 765 | 0.000 | 102 | 765 | 257 KB | 4 ms | 37 ms |
| `/contact` | 99 | 100 | 763 | 0.000 | 94 | 763 | 251 KB | 2 ms | 16 ms |
| `/carrieres` | 100 | 100 | 762 | 0.000 | 89 | 762 | 250 KB | 1 ms | 2 ms |
| `/mentions-legales` | 100 | 100 | 762 | 0.000 | 92 | 762 | 251 KB | 10 ms | 61 ms |
| `/politique-de-confidentialite` | 100 | 100 | 912 | 0.000 | 92 | 912 | 259 KB | 1 ms | 4 ms |
| `/domaines-activite/eclairage-public` | 100 | 100 | 761 | 0.000 | 89 | 761 | 251 KB | 3 ms | 7 ms |
| `/domaines-activite/installations-electriques` | 99 | 100 | 760 | 0.000 | 94 | 760 | 251 KB | 4 ms | 11 ms |
| `/domaines-activite/infrastructures-reseaux-electriques` | 99 | 100 | 760 | 0.000 | 92 | 760 | 251 KB | 2 ms | 25 ms |

Median across routes: **LCP 762.6 ms, CLS 0.0000, TBT proxy 93.5 ms,
performance score 99**. Worst route medians: LCP 912.4 ms, TBT 103.5 ms.

**Verdict per budget:**

| Budget | Target | Result | Verdict |
| --- | --- | --- | --- |
| LCP | < 2 500 ms | 760–912 ms medians (worst spread 172 ms) | **PASS** |
| CLS | < 0.1 | 0.0000 on every route, every run | **PASS** |
| INP | < 200 ms | **not measurable here** (no field data; Lighthouse does not measure INP). Lab **TBT proxy**: 88.5–103.5 ms medians, within the 200 ms proxy target. Synthetic Event-Timing sanity check (drawer open + Escape at 4× CPU): max interaction **56 ms** — not a measured INP | **PASS on the lab proxy, INP itself not claimed** |

**Lab caveats (stated, not hidden):**

- LCP is optimistic: the page is served from localhost, so there is no real
  DNS/TLS/TTFB/CDN latency or real mobile network. The 2.5 s budget keeps a
  large margin (worst lab median 912 ms) but the real-world figure must be
  measured on the deployed host.
- **TBT is host-contention sensitive.** An earlier run of the same script while
  stale Chromium processes and other builds were active on the machine reported
  TBT medians of 296–870 ms and performance scores 80–96; repeating the run on
  an idle machine (the committed evidence) gives 88.5–103.5 ms and 98–100
  scores. The audit therefore requires the host to be idle (one Chromium, one
  server) — as the tooling note already warns — and the committed JSON is the
  clean run.
- The synthetic Event-Timing number is a sanity check on a scripted
  interaction; it is not INP and must not be reported as field INP.


## 5. Claims audit — PASS

**Scope.** Every route of the P1 matrix, under **all six fixture scenarios**,
over the real served HTML: 6 × 19 = **114 documents** per full run (published
200s, gated/unknown 404s, the reserved `/en`). Scanned in visible text, in
`<head>` metadata (title/description/Open Graph/Twitter/canonical) and in the
JSON-LD graph.

**Denylist derivation** (`scripts/audit/lib.mjs`, from
`docs/company/facts-register.md` §2–§3 and the ticket): ONEE wording; agrément /
agréé / certification / homologation; founding years 2004/2011 and « plus de
20 ans »; RC 517; stale capitals (6 000 000 / 4 700 000 / 500 000 MAD);
historical addresses (Ribat Al Fath / Hay El Fath); IF 6580342; MHVP /
HTA-BT0; gated solaire/ENR vocabulary; gated client/buyer names and bid
wording; gated financial/procurement figures; phone numbers and `tel:` links;
social-network URLs; CNDP receipt/authorization numbers; internal filing codes
(`F-###`, `D-###-####`); placeholders; gated mailboxes (`recrutement@`,
`ste.hay2010@gmail.com`, `no-reply@`) — the last three also in metadata.
Structured data is additionally checked for gated types (`LocalBusiness`,
`JobPosting`, `BreadcrumbList`, `Review`, `Article`, `Person`, `Service`, …) and
gated properties (`sameAs`, `logo`, `telephone`, `foundingDate`,
`openingHours`, `areaServed`, …).

**Positive checks (so the denylist cannot pass by hiding everything).** The
cleared facts must render where the decisions put them: `SOCIETE HAY 2010`,
`Société à responsabilité limitée (SARL)`, `15 000 000 MAD`,
`Local N° 21, Hay El Manzeh, Hay Er-Riad, Rabat — Maroc`,
`RC 87305 — Tribunal de commerce de Rabat`, `001459327000056`,
`contact@hay2010.ma`, `donnees@hay2010.ma` on both legal pages;
`Références sur demande.` on `/realisations`; `Plus de 10 ans d'expérience`,
the four service words and the gérant line where approved; the identity/contact
footer on every 200 page.

**Results:**

| Scenario | Routes | Gate matrix | Gated claims | Structured data | Media | Links | Privacy | Cleared facts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `p1` (launch) | 19 | PASS | 0 | 0 | 0 | 0 | 0 | PASS |
| `p2` | 19 | PASS | 0 | 0 | 0 | 0 | 0 | PASS |
| `p3` | 19 | PASS | 0 | 0 | 0 | 0 | 0 | PASS |
| `p1-gates-closed` | 19 | PASS | 0 | 0 | 0 | 0 | 0 | PASS |
| `p1-recrutement` | 19 | PASS | 0 | 0 | 0 | 0 | 0 | PASS |
| `p1-hero-image` | 19 | PASS | 0 | 0 | 0 | 0 | 0 | PASS |

`[audit] 42/42 checks passed across 6 scenario(s)` — 0 findings; the only
matches are **documented fixture-only exceptions**, recorded in the evidence
JSON with their reason:

- `p1-recrutement` / `carrieres` (the F-113-granted simulation, explicitly
  "never a production corpus"): the fictitious `autorisation CNDP n° …
  F113-SIMULATION` and the `recrutement@hay2010.ma` mailbox are published on
  purpose to prove the live-copy path;
- `p2` / `p3`: the Énergies renouvelables domain is **open by corpus design**, so
  the published domain label « Énergies renouvelables et solaire » renders on
  the pages that list it (4 occurrences each scenario). The launch state `p1`
  never renders it.

**Gate matrix check (independent of the HTTP suite).** For each scenario the
sitemap equals the expected published set exactly (`p1` 11, `p2`/`p3` 13,
`p1-gates-closed` 9, `p1-recrutement`/`p1-hero-image` 11 URLs), every expected
gated route answers **404**, `/en` and the unknown route answer 404, and no
audited route answers a redirect or 5xx.

**Out-of-P1-scope observation (reported, not hidden).** `/prototype/homepage` was
the #13 throwaway design prototype: served 200, `noindex,nofollow`, unlinked,
absent from the sitemap, robots and the P1 matrix. It was outside this ticket's
route scope, but its `?variant=b` rendering showed prototype-only
« Agréments ONEE — publication en attente des certificats » wording. **Removed
from the shipped app in the review-fix pass** (`fix/p1-review`): it sat outside
the P1 route set and carried provisional claim wording, so the public app no
longer serves it. The design prototype itself is preserved in git history and on
the `prototype/homepage` branch, with its evidence under `docs/homepage/`; the
claims evidence JSON below predates the removal and is kept as the audit record.

## 6. No analytics, cookie banner or form element — PASS

Over the same 114 served documents:

- **0** `<form>`, `<input>`, `<textarea>` or `<select>` elements (interactive
  `<button>`s are the drawer trigger/close only — not a form);
- **0** analytics script sources, analytics hosts or analytics API markers
  (`dataLayer`, `gtag(`, `fbq(`, `_paq`, plausible, mixpanel, …);
- **0** consent-banner markers outside `<main>` (the policy's `#cookies`
  section is legal copy inside the content landmark) and **0** tracking cookies
  in `Set-Cookie` on any public response;
- browser audit cross-check on every published route: **18–23 requests per
  page, 0 third-party requests, 0 failed requests**, so fonts/assets/scripts are
  all first-party.

## 7. Reproduction

```bash
export npm_config_cache=/home/eloaurdi/codeprojects/hay2010website/.worktrees/.cache/npm

# merge gate (unchanged): 6 fixture scenarios, HTTP suite only, browser-free
rm -rf .next && npm run typecheck && npm run lint && TEST_HTTP_PORT=3133 npm test

# fixture-vs-CMS parity + CMS suite (disposable Postgres, port 5530)
npm run test:cms

# browser audit: keyboard, motion, CLS, breakpoints, axe, claims, privacy
node scripts/audit/audit.mjs            # builds fixture p1, serves on 3133
node scripts/audit/audit.mjs --no-build # reuse .next
node scripts/audit/audit.mjs --base-url http://127.0.0.1:3133

# claims + privacy + gate matrix over all six scenarios (6 builds)
node scripts/audit/claims-scenarios.mjs
node scripts/audit/claims-scenarios.mjs --scenario p1 --no-build

# lab performance: Lighthouse 13.6.0 attached to our own Chromium debug port
node scripts/audit/lighthouse.mjs
node scripts/audit/lighthouse.mjs --routes /,/contact --runs 3
```

Ports used: site **3133**, DevTools **9133** (never 3000/9222), CMS fixture
**3129**, CMS **3130**, Postgres **5530**. The scripts refuse to test an unknown
server already listening on the site port, stop the server on exit, and remove
the disposable container/uploads on completion. One Chromium (~380 MB) and one
production build at a time — the audit was run alone on the host.

Dependencies added for the audit (committed together with the lockfile):
`playwright-core` **1.65.1** (exact, matches cached Chromium revision 1255) and
`axe-core` **4.14.1**. `lighthouse@13.6.0` is run via `npx` and is deliberately
**not** a repository dependency; the default `npm test` remains database- and
browser-free.

## 8. Acceptance criteria — PASS/FAIL

| # | Criterion | Verdict | Evidence |
| --- | --- | --- | --- |
| 1 | P1 route matrix renders identically under the fixture and CMS corpora — same statuses, sections, gates | **PASS** | §1: 18 routes, 11 published / 7 gated, 11 sitemap URLs, 0 differences; 35 CMS tests pass |
| 2 | Keyboard-only pass: skip link, drawer open/close, visible focus, Escape, focus return | **PASS** | §2: first Tab = skip link → main; Tab-reachable trigger; Enter/Space open; Tab trap both directions; Escape closes and returns focus to trigger; computed 2–3 px outline rings; `aria-current` on row and drawer |
| 3 | Reduced motion honoured, no layout shift, 360/768/1024/1440 breakpoints verified | **PASS** | §3: reduce → animations neutralised (computed), no-preference control still animates; CLS 0.0000 with zero shifts on 11 routes; 44/44 no-overflow; 8 committed screenshots |
| 4 | Performance budgets met on mobile 4G: LCP < 2.5 s, CLS < 0.1, INP < 200 ms | **PASS (lab) — INP not verifiable** | §4: LCP 760–912 ms and CLS 0.0000 on every published route (median of 3 Lighthouse mobile runs) and the TBT lab proxy 88.5–103.5 ms are within budget. **INP cannot be verified in this environment** (no field data, Lighthouse does not measure INP) and is not claimed as measured; the synthetic Event-Timing sanity check is 56 ms. Field INP must be confirmed after launch (§9) |
| 5 | Claims audit confirms no gated claim renders anywhere | **PASS** | §5: 114 documents across 6 scenarios, 0 gated-claim findings, 0 structured-data gated types/properties, 0 photographs beyond the brand mark (except the documented hero fixture), 0 gated links/mailboxes, cleared facts all render; only documented fixture-only exceptions |
| 6 | No analytics, cookie banner or form element on any public page | **PASS** | §6: 0/114 documents with analytics, banner, form control or tracking cookie; 0 third-party and 0 failed requests in the browser |
| 7 | Audit report attached to the ticket | **PASS (repo-side)** | This report + committed evidence JSON/screenshots/logs. Posting the comment/permalink on issue #33 needs the merged commit pushed — that is the lead's merge action, not done from this worktree |

## 9. Not verifiable in this environment

Stated so they are not mistaken for failures — and not claimed as passes:

- **INP and field Core Web Vitals.** No field data exists: the site is not
  launched, so there is no CrUX, RUM or analytics data. Lighthouse does not
  measure INP. A synthetic Event-Timing sanity check (drawer open + Escape at
  4× CPU) shows a max interaction duration of **56 ms**, but this is a
  synthetic interaction, not a field INP. Per the brief, the TBT lab proxy is
  reported instead of claiming INP.
- **TBT as an INP proxy.** The committed clean run reports TBT 88.5–103.5 ms
  medians (within the 200 ms proxy target), but TBT is load-time main-thread
  work, not measured interaction latency, and it is strongly host-contention
  sensitive (§4). It should be re-checked with field INP after launch.
- **Real host latency.** LCP is optimistic because the page is served from
  localhost: no real DNS/TLS/CDN/TTFB, no real 4G. Real-world LCP will be
  higher than these lab numbers (the 2.5 s budget has headroom: worst median
  920 ms lab).
- **Real devices and other engines.** Chromium headless only. No Safari/iOS, no
  Firefox, no physical phone, no touch/visual-viewport behaviour beyond
  emulation.
- **Screen-reader announcements.** Semantics/ARIA are checked (axe + keyboard
  behaviour), but actual NVDA/VoiceOver/TalkBack speech output was not heard.
- **Visual regression.** Screenshots are evidence and overflow is asserted;
  there is no pixel-diff baseline (deferred by the spec, no second tool added).
- **GitHub Actions.** The CI workflow was not executed here. `npm run test:cms`
  is **not wired** into the CI `verify` job (decision in §10); that wiring is
  therefore unverified in CI.
- **Deployed host / production headers / Cloudflare.** No deployed environment
  exists yet; CDN caching, edge analytics absence and production security
  headers were not observed.

## 10. CI: CMS suite wiring decision (documented gap)

`docs/build/verification.md` and `docs/build/cms.md` document `npm test` as the
merge gate and `npm run test:cms` as the separate CMS acceptance check. Ticket
#33 offered to wire the CMS suite into the GitHub Actions `verify` job
("GitHub Actions has Docker + the postgres service") if reliable. **It is
left unwired and documented here instead**, because:

1. it cannot be verified from this environment — editing `.github/workflows/ci.yml`
   without running a GitHub runner would ship an untested CI change;
2. the `verify` job already has a 30-minute timeout with six scenario builds,
   the ops checks and the backup/restore rehearsal; `npm run test:cms` adds two
   more production builds plus migrations, seed and the CMS suite (~4–6 min on
   this host), which is a real timeout risk on a shared ARM runner;
3. Docker availability in that job is proven (the backup rehearsal runs
   `postgres:16-alpine`), so the only uncertainty is runtime, not capability.

If the lead accepts the timeout headroom, the exact step to add after "Build
and run the HTTP suite" is:

```yaml
      - name: Fixture-vs-CMS parity and CMS acceptance
        run: npm run test:cms
```

It needs no extra service (the script starts its own container on port 5530)
and leaves no artefacts.

## 11. Findings carried by this audit

| Finding | Status |
| --- | --- |
| Legal-page tables were horizontally scrollable but not keyboard-reachable (axe `scrollable-region-focusable`, 2 nodes) | **Fixed** in the audited tree (`components/site/legal-document.tsx`); 0 axe violations after |
| `/prototype/homepage?variant=b` renders prototype-only ONEE/agrément wording on a public, `noindex` URL | **Fixed** in the review-fix pass: the prototype route was removed from the shipped app (outside the P1 route set, provisional claim wording). Preserved in git history / `prototype/homepage` branch |
| Lab TBT proxy is sensitive to host contention | **Method note**: only the idle-host run is committed (88.5–103.5 ms); field INP must still be measured after launch (§4, §9) |
| `npm run test:cms` not wired into CI | **Documented gap** with the exact step (§10) |
| Flaky `tests/cms` media-revalidation assertion (1/35 on one run, clean on rerun) | **Reported** as a #30 test race, not a product regression; parity unaffected (§1) |
| `npm test` unchanged and browser-free; no second runner added; `scripts/audit/**` is committed and explicit | **Done** |
