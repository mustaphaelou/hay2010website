# Crawler surface — canonical URLs, metadata, JSON-LD, OG card, robots, sitemap and the legacy URL map

Status: implemented by ticket [#32](https://github.com/mustaphaelou/hay2010website/issues/32).
Decision record: [`docs/seo/seo-metadata.md`](../seo/seo-metadata.md) — this
document says **where** each decision lives and **how to verify it**, not what
the decision is. Read the SEO doc first; the code does not re-litigate it.

Everything here is observable over HTTP and asserted by the one suite
(`tests/http/`, see [`verification.md`](./verification.md)).

---

## 1. One home: `lib/seo`

| File | Responsibility |
| --- | --- |
| `lib/seo/site.ts` | Canonical origin, `metadataBase` value, site identity (name, legal name, locale, mailbox, OG descriptor), `canonicalPath()` / `absoluteUrl()`. |
| `lib/seo/pages.ts` | Code-owned launch metadata: one `{ phrase, description, webPageType }` per static P1 route, from SEO §3.3 adapted to the decided P1 routes. |
| `lib/seo/metadata.ts` | `resolvePageSeo()` (model + defaults + validation) and `pageMetadata()` (full Next `Metadata`). |
| `lib/seo/structured-data.ts` | `buildPageGraph()` — Organization + WebSite (homepage) + WebPage with the accurate subtype. |
| `lib/seo/index.ts` | The single import surface for pages. |
| `components/seo/page-json-ld.tsx` | The native `<script type="application/ld+json">` renderer with `<`/U+2028/U+2029 escaping. |

`lib/site/metadata.ts` (#22–#24) and `lib/legal/metadata.ts` (#28) were absorbed
and removed; a page imports `@/lib/seo` for its head and its JSON-LD. The
canonical origin exists once, in `lib/seo/site.ts`.

### Canonical origin and `NEXT_PUBLIC_SERVER_URL`

```ts
SITE_ORIGIN = normalizeOrigin(process.env.NEXT_PUBLIC_SERVER_URL) ?? "https://hay2010.ma"
```

- **Production**: `https://hay2010.ma`, baked at build (Docker build arg / CI
  variable). A changed host requires a rebuild (SEO §2.4, #8 §6).
- **Staging**: `https://staging.hay2010.ma`, set for the staging build. Staging
  is `noindex`; its canonicals are self-referencing for honesty, not ranking.
- **Documented fallback — previews and local development**: unset **or invalid**
  values fall back to the production apex, never `localhost`; a preview must not
  emit a localhost canonical or share-card URL. An invalid value fails closed to
  the apex instead of throwing during the build.
- The value is reduced to `url.origin`: path, query, hash and trailing slash are
  stripped at the boundary.
- Host redirects (`http`/`www` → apex) stay at Cloudflare, not in the app
  (SEO §2.2); they are an operator action for #16.

### URL policy

- Apex, HTTPS, no `www`, no trailing slash, no query, no fragment, French at the
  root (SEO §2.3/§2.5). `trailingSlash: false` + `skipTrailingSlashRedirect`.
- One self-referencing canonical per page; the homepage canonical is the origin
  itself. No canonical on a 404, 410, redirect or gated page.
- `metadataBase` is mandatory and set once in `app/(frontend)/layout.tsx`.
- Case variants of old paths are mapped explicitly; no generic lowercasing.

## 2. Metadata model

- Root layout (`app/(frontend)/layout.tsx`): `metadataBase`, title template
  `%s — HAY2010` + default, homepage description, `applicationName`, `referrer`,
  `formatDetection`, robots + Googlebot hints, default Open Graph/Twitter, and
  the `viewport` export (`theme-color #F7F6F1`, `color-scheme: light`,
  `viewport-fit=cover`).
- Pages supply the **keyword-led phrase only** (no brand suffix) and the page
  model's decided description; `pageMetadata()` returns the **full**
  `openGraph`/`twitter`/`robots` objects because Next's metadata merge is
  shallow (SEO §3.7). The homepage uses `title.absolute`; every other page gets
  exactly one `— HAY2010` from the template.
- Validation in `resolvePageSeo()`: non-empty phrase without the brand suffix,
  title ≤ 65 characters, description within the hard 100–170 bounds, plain text
  only. A published page cannot ship an empty head; a bad page-model value fails
  the build instead of rendering `undefined` (SEO §3.5).
- The P1 defaults render 120–160 character descriptions for every P1 URL; the
  suite also asserts uniqueness across every published route of every scenario.

### #30 CMS override hook

The page model is already the description source: each page passes
`description: page.description` to `resolvePageSeo()`. When #30 adds the Payload
`seo` group (title, description, OG image — developer-only at launch, content
model §3), wire it at the same call sites:

```ts
resolvePageSeo({
  path: HREF,
  phrase: page.seo?.title ?? undefined,        // optional override
  description: page.seo?.description ?? page.description,
})
```

`resolvePageSeo` trims and validates the override; an empty/invalid override
falls back to the code-owned default rather than shipping a broken head. What
the CMS must **never** own: canonical path, robots directive, sitemap entry, the
brand suffix, the OG card (per-record images only for rights-cleared records),
identity fields or `knowsAbout` (SEO §3.1).

## 3. Structured data

One native JSON-LD block per page, one `@graph` (`lib/seo/structured-data.ts`):

- `Organization` on every page — facts-register-cleared fields only: `name`,
  `alternateName ["HAY 2010"]`, `legalName`, `url`, `email contact@hay2010.ma`,
  approved positioning line, registered-seat `PostalAddress`, RC/ICE
  `PropertyValue` identifiers and the four approved services in `knowsAbout`.
- `WebSite` **homepage only**, no `SearchAction` and no demo tagline.
- `WebPage` on every page with the accurate subtype: `AboutPage` (`/a-propos`),
  `ContactPage` (`/contact`), `CollectionPage` (`/realisations`), `WebPage`
  elsewhere. `@id` = canonical + `#webpage`, `name` = resolved `<title>`.
- Deliberately absent: `LocalBusiness`/`Electrician`, `JobPosting`,
  `BreadcrumbList`, `Review`/`AggregateRating`, `Service`, `FAQPage`, `Article`,
  `Person`, and every gated property (`sameAs`, `logo`, `telephone`,
  `foundingDate`, `areaServed`, `openingHours`, …). The suite parses the served
  graph, whitelists the types and denies the gated properties (§5.10).
- The 404 document publishes no JSON-LD.

## 4. The default share card — a committed static PNG

**Choice: static file generated by a committed script, not a runtime
`ImageResponse` route.**

- File: `public/og/hay2010-default.png` — 1200 × 630, sRGB, ~44 KB (under the
  300 KB budget), ink `#111217` background, paper `#F7F6F1` wordmark, one orange
  `#E97425` rule, line `Éclairage public · Réseaux HTA/MT · CFO/CFA`, origin
  `hay2010.ma` bottom-right, ≥ 96 px safe margins, no text in the bottom 60 px.
- Wordmark as **text** in Poppins Light 300 — no badge artwork until ownership is
  confirmed, no photograph until a rights-cleared image exists (SEO §4.1).
- Descriptor in `lib/seo/site.ts`: absolute `/og/hay2010-default.png`,
  `image/png`, 1200×630, French alt. Every page's `openGraph.images` and
  `twitter.images` re-spread it (shallow merge).
- Regenerate with **`npm run og:generate`** (`scripts/generate-og-card.mjs`).
  The script renders the card with Next's bundled `next/og` (satori + resvg) and
  the two Poppins TTF files committed in `scripts/assets/og/` (SIL OFL, licence
  next to them) — it works offline, from a clean checkout, with no external
  asset and no extra dependency. Commit the regenerated PNG with the change.
- Why not a route: the decision rejects a dynamic card at launch (§4.4) — a
  runtime route, font loading and a large handler bundle for no benefit, while
  the static file is cached at the edge. No root `opengraph-image.*` file is
  added, so a per-record cover stays possible later (§4.2).

## 5. `robots.txt`

`app/robots.ts` (production) and `proxy.ts` (#31 staging) split the behaviour:

- **Production**: `User-Agent: *`, `Allow: /`, `Disallow: /admin`, `/api/`,
  `/preview/`, `Sitemap: https://hay2010.ma/sitemap.xml`. No crawl-delay, no
  host line, no AI block list, and **no** disallow of `/_next/`, `/og/`, the
  sitemap or the dead WordPress paths — the status codes retire the latter
  (SEO §6.1/§6.4).
- **Staging**: the proxy short-circuits `/robots.txt` with a disallow-all body
  and no sitemap line, before the route runs; every staging response carries
  `X-Robots-Tag: noindex, nofollow`. `app/robots.ts` also branches on
  `isStaging()` as defence in depth. Neither edits the other's environment.
- `/admin`, `/api/:path*` and `/preview/:path*` also carry
  `X-Robots-Tag: noindex, nofollow` from `next.config.ts` headers (defence in
  depth; robots.txt is not a security control). Public pages never carry the
  header in production.
- Verification gap, stated honestly: `npm test` builds production-mode
  scenarios, so the **staging** robots/noindex behaviour is asserted by
  `scripts/check-ops.mjs` (`npm run check:ops`, run on #31's gate), not by the
  HTTP suite.

## 6. `sitemap.xml`

`app/(frontend)/sitemap.ts` derives the list through the content seam — never a
hardcoded URL list (SEO §6.2):

1. published rubriques **with a page document** (a published-but-unbuilt route
   never appears), in registry/CDC order;
2. published domains.

Rules: absolute apex URLs via `absoluteUrl()`, no trailing slash, no query, no
`lastModified` in P1 (the corpus has no real update date; a build timestamp is
fake churn), no `changeFrequency`/`priority`, no image/video extension, no
sitemap index. The gated named-case-study family has no record and therefore no
entry; `/en`, `/admin`, `/api`, `/preview`, the prototype, redirects, 404s/410s
and assets are never listed. #30 revalidates `/sitemap.xml` on publish.

Expected set by scenario (asserted exactly): `p1`, `p1-gates-closed` and
`p1-recrutement` list the nine P1 pages + three domains (eleven URLs);
`p2`/`p3` add the two opened domain documents. The suite fails if any gated URL
appears in the sitemap, a redirect target or an internal link.

## 7. Legacy WordPress URL map

The old site is a Porto/WordPress demo with no content to migrate (SEO §7.1).
Every old address is permanently resolved or retired. **301s live in
`next.config.ts`** (redirects run before the proxy); **410s, query cleanup and
case variants live in `proxy.ts`** (a redirect cannot return 410, drop a query
string, or match case-sensitively).

### 7.1 301 — equivalents that keep value (`next.config.ts`)

`/company/` → `/a-propos` · `/services/` and its four demo children →
`/domaines-activite` · `/projects/`, `/project/` (archive) → `/realisations` ·
`/contact/` → `/contact` (the 200 target; `/contact` is never a source) · the
old sitemap files (`/sitemaps.xml`, `/sitemap_index.xml`, `/wp-sitemap.xml`,
`/page-sitemap1.xml`, `/post-sitemap1.xml`, `/category-sitemap1.xml`) →
`/sitemap.xml` · `/robots.txt/` and `/sitemap.xml/` → the file path.

Both slash and no-slash sources are listed, with `statusCode: 301` (not
`permanent: true`, which emits 308). `skipTrailingSlashRedirect` is enabled so
these sources answer **in one hop** instead of a 308→301 chain; the generic
trailing-slash normalisation for every other path is then done in the proxy with
a permanent 308 (SEO §2.3/§7.7 allow both statuses; the distinction is method
preservation).

### 7.2 410 — demo content and dead structures (`proxy.ts`)

Posts and date archives (`/YYYY/…`), `/project/{slug}` records (the archive is a
301), `/member/*`, `/category/*`, `/tag/*`, `/author/*`, feeds
(`/feed*`, `/comments/feed`), WooCommerce (`/shop*`, `/cart`, `/my-account`,
`/checkout`, `/product*`, `/product-category*`), WordPress assets
(`/wp-content/*`, `/wp-includes/*`), `/sitemaps.xsl`, `/sample-page`,
`/page/:n`, `/search*`, and `/blog/` + children until Actualités is live.

The 410 response is a minimal branded HTML document (ink/paper, French), status
410, `X-Robots-Tag: noindex` (staging also `nofollow`), `Cache-Control:
no-store`, **no** `Location`, **no** canonical, no navigation beyond the home
link, and no structured data. `/blog/` becomes a 301 to `/actualites` as soon as
the rubrique is published **and** has a page document (`actualitesLive`), read
through the content seam — #30 opens it with content, not code.

WordPress internals (`/wp-admin*`, `/wp-json*`, `/xmlrpc.php`, `/wp-login.php`)
are **404 at the Cloudflare edge** (SEO §7.4, operator action for #16); if a
request reaches the origin it serves the router's branded 404, never a 200.

### 7.3 Query strings and case variants (`proxy.ts`)

- `/?p=143` (old home shortlink) and `/?s=…` → **301 to `/`, query dropped**
  (a `redirects()` destination cannot drop the incoming query string, which is
  why these are not in `next.config.ts`).
- Any other `?p=`, `?page_id=`, `?cat=`, `?author=`, `?m=`, `?attachment_id=`,
  `?preview=`, `?wc-ajax=`, `?replytocom=`, `?share=`,
  `?customize_changeset_uuid=` → **410**. `?s=` on a non-home path → 410.
- Tracking parameters (`utm_*`, `fbclid`, `gclid`, …) are untouched: the page
  renders 200 and the canonical strips the query.
- Case variants `/Company/`, `/SERVICES/`, `/PROJECTS/`, `/CONTACT/` → 301 to
  the new equivalent, exact-match and case-sensitive in the proxy because Next's
  redirect sources match case-insensitively (a `/CONTACT` source would also
  match the canonical `/contact` and self-redirect).

### 7.4 Guarantees and non-interference

- Every 301 target is the decided P1 route and returns 200 in the launch state;
  no target is a permanently gated URL (P2/P3 tier gate, the case-study family,
  `/en`, `/admin`, `/api`, `/preview`). No redirect loop, no chain beyond the
  generic normalisation, no 410 on a new route.
  Caveat, stated because the suite runs it: the `p1-gates-closed` fixture
  scenario deliberately unpublishes one P1 page (a content-unpublish simulation,
  not a tier gate). The code-owned redirect map still points at that page's
  decided route, so in that simulation a legacy URL resolves to the branded 404
  until the page is republished; the suite asserts exactly that instead of
  pretending the map is gate-aware. Making the 301 map gate-aware would need a
  proxy-level redirect (redirects run before the proxy), which the decision
  keeps out of the request path.
- `/api` and `/admin` are never intercepted by the legacy logic: `/api/health`
  keeps answering JSON and Payload's admin keeps its own auth/route behaviour;
  they only gain the `X-Robots-Tag` defense-in-depth header.
- The proxy matcher still excludes `_next/static` and `_next/image`; the legacy
  rules are static maps/regex only, no CMS fetch except the `/blog` gate.

## 8. Verification map

| Suite | Proves |
| --- | --- |
| `tests/http/seo.test.ts` | Approved title/description per P1 route, uniqueness and 120–160 bands, one apex slash-free canonical, full `fr_FR` OG/Twitter, head baseline, 404 metadata, gated-claim denylist. |
| `tests/http/structured-data.test.ts` | One parsed `@graph`, type whitelist and subtype per route, Organization clear facts, WebSite homepage-only, stable `@id`s, gated-property denylist, no JSON-LD on a 404. |
| `tests/http/og-card.test.ts` | Served PNG 1200×630 under 300 KB, used as default `og:image`/`twitter:image` on every page, absent on the 404. |
| `tests/http/robots.test.ts` | Production rules (allow public, disallow admin/API/preview, sitemap), no staging directives in production, no blocked crawl resources, sitemap actually served. |
| `tests/http/sitemap.test.ts` | Exactly the published set per scenario, canonical 200 for each entry, no gated/legacy/admin URL, no fake `lastmod`/priority, crawlable. |
| `tests/http/legacy-urls.test.ts` | Table-driven 301 map (target 200, apex, no query), 410 groups/query strings with no `Location`, case variants, permanent slash normalisation, no gated redirect target, `/api`/`/admin` untouched, WP internals 404. |
| `tests/http/gates.test.ts` | (existing, extended by #32) the sitemap never lists a gated/closed/unbuilt route. |

The suite reads only the served production build — status, headers and HTML. The
OG card test reads the served bytes; no image library is added.

## 9. Not in this ticket / operator follow-ups

- Cloudflare edge rules: `http`→`https`, `www`→apex 301 and the WordPress
  internals 404s (SEO §2.2/§7.4) — [#16](https://github.com/mustaphaelou/hay2010website/issues/16).
- Search Console/Bing DNS verification, sitemap submission, share-card preview
  debuggers (Facebook/LinkedIn/X/WhatsApp) — manual launch gates (SEO §6.4/§10.2).
- Per-page OG cards, `Article` JSON-LD, `sameAs`, `logo`, `LocalBusiness`: gated
  by rights/ownership and phase-2 content; the builders are ready to extend but
  must not be added until their decision documents allow it.
- The 404 document also emits Next's own `noindex` hint next to the branded
  `noindex, nofollow`; banner duplication is harmless and both mean the same.
