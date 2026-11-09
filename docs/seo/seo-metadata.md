# HAY2010 — SEO, metadata and structured data

**Status:** resolved 2026-11-09 — ticket [#11](https://github.com/mustaphaelou/hay2010website/issues/11) (local `10-seo-metadata.md`).
**Depends on (all resolved):** [#2](https://github.com/mustaphaelou/hay2010website/issues/2) (page tree), [#3](https://github.com/mustaphaelou/hay2010website/issues/3) (facts), [#4](https://github.com/mustaphaelou/hay2010website/issues/4) (brand), [#5](https://github.com/mustaphaelou/hay2010website/issues/5) (content model), [#6](https://github.com/mustaphaelou/hay2010website/issues/6) (réalisations), [#8](https://github.com/mustaphaelou/hay2010website/issues/8) (hosting) and [#10](https://github.com/mustaphaelou/hay2010website/issues/10) (legal/analytics).
**Scope:** on-site SEO, metadata, Open Graph, structured data, `robots.txt`, `sitemap.xml`, legacy WordPress URLs and French keyword targets for the launch pages. Not in scope: analytics (decided in [#10](https://github.com/mustaphaelou/hay2010website/issues/10)), forms ([#12](https://github.com/mustaphaelou/hay2010website/issues/12)), public launch ([#16](https://github.com/mustaphaelou/hay2010website/issues/16)), Google Business Profile, paid search or content marketing.
**Source of truth:** [`docs/company/facts-register.md`](../company/facts-register.md) for legal identity and approved claims; [`docs/content/content-model.md`](../content/content-model.md) for schema and gates; [`.scratch/hay2010-website/issues/01-page-tree.md`](../../.scratch/hay2010-website/issues/01-page-tree.md) for routes. If a claim is not in the register, it does not appear in metadata or structured data.

> **One-line rule:** one canonical URL, one unique title and description, one Organization entity, and no gated fact, placeholder, client name, logo, phone, social handle or founding year anywhere in the metadata — including JSON-LD.

---

## 1. The decision

| Item | Decision |
|---|---|
| **Canonical origin** | **`https://hay2010.ma`** — apex, HTTPS, no `www`, no trailing slash. |
| **Host redirects** | `http` → `https` and `www` → apex at **Cloudflare**, 301, not in the app. |
| **Trailing slash** | No trailing slash. Explicit legacy paths use **301**; generic normalisation uses Next's **308** (permanent). |
| **Canonical tags** | Absolute, self-referencing, query-free, no trailing slash. `metadataBase` is mandatory. |
| **Staging / preview / admin** | Never indexable: `X-Robots-Tag: noindex, nofollow` on `/admin`, `/api`, `/preview` and every staging response; disallow-all `robots.txt` on staging. Gated content returns **404**. |
| **Title pattern** | `{keyword-led page phrase} — HAY2010`; em dash, one brand suffix, homepage uses `title.absolute`. |
| **Descriptions** | Unique, 120–160 characters, target 140–160; one primary keyword and one concrete offer; no "Découvrez", no lists, no gated claims. |
| **Metadata ownership** | Code-owned in `lib/seo.ts` at launch; Payload `seo` fields are developer-only. Page copy remains owner-editable. |
| **Language** | `<html lang="fr">`, `og:locale="fr_FR"`, `inLanguage: "fr"`; French only, no `hreflang`. |
| **Share card** | One static 1200×630 typographic card, code-driven `openGraph.images`; no badge until logo ownership is confirmed; no per-page card at launch. |
| **Structured data** | `Organization` + `WebSite` (homepage) + `WebPage`; `Article` only for a live communiqué. **No LocalBusiness/Electrician, JobPosting, BreadcrumbList, Review or sameAs at launch.** |
| **Crawl files** | `robots.ts` and `sitemap.ts`; eight launch URLs; no `priority`/`changeFrequency`; AI crawlers allowed at launch. |
| **Legacy WordPress** | 301 for equivalents and sitemaps; 410 for demo pages, archives, feeds, WooCommerce and WP assets; 404/403 at the Cloudflare edge for WP internals. No content migration. |
| **Keywords** | Four service clusters on `/metiers`, one local umbrella on `/`; no solaire until the gate opens; no blog, no city doorway pages, no `meta keywords`. |
| **Deliverable** | This decision record. **No production code in #11**; `lib/seo.ts`, redirects, `proxy.ts`, `robots.ts` and `sitemap.ts` land with the page build and #16. |

---

## 2. Canonical origin and URL policy

### 2.1 Canonical origin

`https://hay2010.ma` is the only canonical origin. The facts register already fixes the website as `https://hay2010.ma`; the current WordPress site uses the apex correctly, and the hosting decision keeps the apex/`www` cutover in [#16](https://github.com/mustaphaelou/hay2010website/issues/16).

- **Apex, not `www`.** `www.hay2010.ma` exists and is proxied, but never serves 200. It 301s to the apex at the edge.
- **HTTPS only.** `http://` 301s to `https://` at the edge (Cloudflare **Always Use HTTPS**).
- **No alternate host.** No `www` canonical, no `staging` canonical in public output, no IP or Coolify hostname in canonical or JSON-LD.

### 2.2 Host redirects at Cloudflare

These are edge rules, not Next routes; they must work before the origin is reached:

| Rule | Result |
|---|---|
| `http://hay2010.ma/*` | 301 to `https://hay2010.ma/*` |
| `http://www.hay2010.ma/*` | 301 to `https://hay2010.ma/*` |
| `https://www.hay2010.ma/*` | 301 to `https://hay2010.ma/*` |
| `https://hay2010.ma/*` | pass to origin |

The `www` DNS record must remain present and proxied so the redirect can run. Do not rely on the app for host redirects; Cloudflare is authoritative. A misplaced origin rule can produce a redirect loop, so add the rules before the public cutover and test with `curl -I` from outside the zone.

### 2.3 Trailing slash, case and query strings

- `trailingSlash: false` in `next.config.ts`. The canonical form has no trailing slash.
- **Explicit legacy paths** use `statusCode: 301` in `next.config.ts`.
- **Generic normalisation** (`/contact/` → `/contact` when a request bypasses the legacy map) uses Next's default **308**. Search engines treat 308 as a permanent redirect; the distinction from 301 is method preservation, not SEO. This is the one deliberate deviation from the shorthand "301 for all trailing-slash variants" in [#2](https://github.com/mustaphaelou/hay2010website/issues/2).
- **Case variants** of known old paths (`/Company/`, `/SERVICES/`, `/PROJECTS/`, `/CONTACT/`) 301 to the new equivalent, because the old WordPress served them with 200. Do not lowercase every path generically: media/slug casing is not guaranteed.
- **Query strings do not affect canonicals.** Canonical tags never include a query string. Tracking parameters (`utm_*`, `fbclid`, `gclid`, `msclkid`, `igshid`) are ignored and return the page 200.
- **WordPress query parameters** are handled in §7.5, not by the canonical tag.
- **URL shape:** lowercase ASCII, hyphen-separated, no accents, no dates, no IDs, no `.html`, no language prefix. The slugs are fixed by [#2](https://github.com/mustaphaelou/hay2010website/issues/2).

### 2.4 `metadataBase` and environments

`metadataBase` is set once in the frontend root layout and is **mandatory**. The Next.js docs say a relative metadata URL without `metadataBase` is a build error; the shipped 16.4.3 resolver actually falls back to `http://localhost:3000` and only warns for Open Graph and Twitter images. On this self-hosted stack that would ship localhost URLs to social crawlers, so the spec does not rely on the docs' error behaviour.

```ts
// lib/seo.ts
export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SERVER_URL ?? "https://hay2010.ma"
)
```

- Production: `https://hay2010.ma`.
- Staging: `https://staging.hay2010.ma`, set in the staging environment. Staging is noindex, so its canonicals are self-referencing for honesty, not for ranking.
- Local development: defaults to `https://hay2010.ma`; never `localhost` in a share card.
- The value is the full origin, no path, no trailing slash. Normalise it at the boundary.
- `NEXT_PUBLIC_SERVER_URL` is part of the build; a changed host requires a rebuild (see [#8](https://github.com/mustaphaelou/hay2010website/issues/8) §6).

Every page passes an explicit canonical path to the metadata helper:

```ts
alternates: { canonical: "/metiers" } // resolved against metadataBase
```

The root homepage canonical resolves to `https://hay2010.ma` (no trailing slash). Anchors such as `/metiers#eclairage-public` are **not** separate canonicals; the canonical is `/metiers`.

### 2.5 What a canonical must never be

- No `www`, `http`, staging host, IP, `localhost` or `r2.dev` URL.
- No trailing slash, query string, fragment, uppercase path or duplicate casing.
- No canonical on a 404, 410, redirect response or gated page.
- No cross-page canonical except a deliberate consolidation; none is planned at launch.
- No `hreflang` or `x-default`: the site is French only and has no alternate locale.

---

## 3. Metadata model

### 3.1 Code-owned vs CMS-owned

| Layer | Owner | Contents |
|---|---|---|
| `lib/company.ts` | Developer | Legal identity, address, `contact@hay2010.ma`, approved claims, ONEE wording and gate. |
| `lib/flags.ts` | Developer | `actualitesLive`, `mediathequeLive`, `solaireLive`, `agrementLive`, `mapLive`, `formLive`, `applicationFormLive`, `cvUploadLive`, `caseStudiesLive`, `recrutementMailboxLive`, `analyticsLive`. |
| `lib/seo.ts` | Developer | `SITE`, title/description defaults, canonical builder, OG defaults, JSON-LD builders, robots/sitemap values. |
| Page copy | Owner (Payload) | Body copy, headings, service copy, images with rights. |
| Payload `seo` group | Developer at launch | Optional `title`, `description`, `ogImage`; no canonical, robots, keywords or free-form suffix. |
| Navigation, redirects | Developer | Fixed by [#2](https://github.com/mustaphaelou/hay2010website/issues/2); slugs immutable. |

The owner cannot edit legal identity, approved claims, navigation, redirects, `robots.txt`, `sitemap.xml` or SEO defaults. The admin shows a read-only **SEO** panel with the computed title, description, canonical, robots directive and OG image, plus the approved Company facts. This is the same boundary as the content model ([#5](https://github.com/mustaphaelou/hay2010website/issues/5) §3–4).

When the gated `communiques` and `projects` collections go live, per-record `seo.description` and `seo.ogImage` may be opened to the owner with validation and developer review; the title remains record title + brand. That is a later change, not a launch behaviour.

### 3.2 Title pattern

Root layout:

```ts
title: {
  template: "%s — HAY2010",
  default: "HAY2010 — Éclairage public et électrification à Rabat",
}
```

- The page supplies the **keyword-led phrase only**; the template appends `— HAY2010` once.
- The homepage uses `title: { absolute: "HAY2010 — Éclairage public et électrification à Rabat" }` so it is not double-suffixed. A page title that already contains `— HAY2010` is a validation error.
- Em dash `—` with spaces, French typography. The lamalif `Page | Company` pipe is not used; the admin title suffix is already `— HAY2010` ([#5](https://github.com/mustaphaelou/hay2010website/issues/5) §11.3).
- Target 45–60 visible characters; hard maximum 65. Do not hard-truncate at render time; fail the build/test instead.
- No keyword stuffing, no repeated brand, no "Accueil", no "Page", no year, no phone, no CNDP number.
- Title casing: French sentence case (`Éclairage public...`, not Title Case).

### 3.3 Title and description table

These are the launch defaults. The CMS `seo` values are optional; if empty, these render. `agrementLive` toggles the longer `/entreprise` and `/realisations` descriptions.

| Route | `<title>` | `<meta name="description">` |
|---|---|---|
| `/` | `HAY2010 — Éclairage public et électrification à Rabat` | `Entreprise d’éclairage public et d’électrification HTA/MT, MT/BT, postes de transformation et CFO/CFA à Rabat. Plus de 10 ans d’expérience. Études et travaux.` |
| `/entreprise` | `L’Entreprise, électricité et éclairage public — HAY2010` | Without `agrementLive`: `HAY2010, société d’électricité et d’éclairage public à Rabat : plus de 10 ans d’expérience au service des collectivités et des entreprises. Études et travaux.`<br>With `agrementLive`: `HAY2010, société d’électricité et d’éclairage public à Rabat : plus de 10 ans d’expérience et agréments ONEE EE HTA-BT et HTA-BT3. Études et travaux.` |
| `/metiers` | `Éclairage public, réseaux HTA/MT et CFO/CFA — HAY2010` | `Les quatre métiers de HAY2010 à Rabat : éclairage public, réseaux HTA/MT et MT/BT, postes de transformation et CFO/CFA. Études et travaux d’électrification.` |
| `/realisations` | `Réalisations et références — HAY2010` | Without `agrementLive`: `Références de HAY2010 en éclairage public et électrification : méthode de projet et références transmises sur demande. Plus de 10 ans d’expérience.`<br>With `agrementLive`: `Références de HAY2010 en éclairage public et électrification : agréments ONEE, méthode de projet et références transmises sur demande. Depuis plus de 10 ans.` |
| `/carrieres` | `Carrières et offres d’emploi — HAY2010` | `Rejoignez HAY2010, entreprise d’éclairage public et d’électrification à Rabat. Consultez nos offres d’emploi et envoyez votre candidature spontanée.` |
| `/contact` | `Contact à Rabat — HAY2010` | `Contactez HAY2010 à Rabat : Local N° 21, Hay El Manzeh, Hay Er-Riad. Écrivez-nous à contact@hay2010.ma pour vos projets d’éclairage public. Devis sur demande.` |
| `/mentions-legales` | `Mentions légales — HAY2010` | `Mentions légales de SOCIETE HAY 2010 (SARL, RC 87305, ICE 001459327000056) : éditeur, propriété intellectuelle, données personnelles et cookies.` |
| `/politique-de-confidentialite` | `Politique de confidentialité — HAY2010` | `Politique de confidentialité de SOCIETE HAY 2010 : données traitées, finalités, durées de conservation, droits et cookies. Contact : donnees@hay2010.ma.` |
| `/actualites` (when live) | `Actualités — HAY2010` | `Communiqués et actualités de HAY2010, entreprise d’éclairage public et d’électrification à Rabat. Suivez la vie de l’entreprise. Informations et projets.` |
| `/actualites/[slug]` (when live) | `{title} — HAY2010` | The record’s `seo.description`, else its `excerpt`, 120–160 characters. |
| `/mediatheque` (when live) | `Médiathèque — HAY2010` | `Photos et médias de HAY2010 : chantiers d’éclairage public, réseaux HTA/BT, postes de transformation et CFO/CFA à Rabat. Images de chantiers.` |
| 404 | `Page introuvable — HAY2010` | None. `robots: { index: false, follow: false }`; HTTP 404. |

The `/contact` description contains `contact@hay2010.ma` and the `/politique-de-confidentialite` description contains `donnees@hay2010.ma`. Both only publish **after** the mailbox send/receive tests in [#10](https://github.com/mustaphaelou/hay2010website/issues/10) §6. Until then, use these staging-safe fallbacks:

- `/contact`: `Contactez HAY2010 à Rabat : Local N° 21, Hay El Manzeh, Hay Er-Riad. Écrivez-nous pour vos projets d’éclairage public. Devis sur demande.`
- `/politique-de-confidentialite`: `Politique de confidentialité de SOCIETE HAY 2010 : données traitées, finalités, durées de conservation, droits et cookies. Comment exercer vos droits.`

The public launch gate is the tested mailbox, not the presence of the address in metadata.

The `/realisations` and `/entreprise` variants that mention ONEE only publish when `agrementLive` is true **and** both certificates are filed; otherwise use the gated variant. The gated variant must not say "agréments", "ONEE", "certifié" or "entreprise agréée".

### 3.4 Description rules

- Unique per page; no sentence reused across pages.
- **120–160 characters**, target 140–160. Hard minimum 100; hard maximum 170. The validator warns, then fails.
- One primary keyword, one proof or qualification (only if approved) and one concrete action or scope. No comma-separated keyword list.
- No `Découvrez`, `Cliquez ici`, `Bienvenue`, `Leader`, `N°1`, `Meilleur`, `Partenaire officiel`, `Entreprise agréée`, `Depuis 2004`, `Depuis 2011`, `Plus de 20 ans`, `RC 517`, `6 000 000`, `4 700 000`, `500 000`, `IF 6580342`, `Solaire`, `Photovoltaïque`, `HTA-BT0`.
- Never attribute an ONEE agrément to `postes HTA/BT`: the two agréments are **EE HTA-BT** and **HTA-BT3** only. "Poste HTA/BT" may appear as a service term, never as an agrément.
- No phone number, Gmail, `recrutement@`, CNDP number, client name, client logo, testimonial or price.
- French typography: typographic apostrophes (`’`), non-breaking space before `: ; ? !` and inside `« »`, accented capitals.
- No HTML, no line breaks, no emoji.
- The description is not a call-to-action slogan; it is the page summary.
- When the page copy changes materially, update the description in the same change.

### 3.5 Fallbacks and empty states

| Missing | Fallback |
|---|---|
| `seo.title` | The page default in §3.3. |
| `seo.description` | The page default in §3.3; for a communiqué, its `excerpt`; for a project, its `scope`; never body copy truncated mid-sentence. |
| `seo.ogImage` | `/og/hay2010-default.jpg` and its alt. |
| Page copy | Build/test failure; a published page cannot have an empty title or description. |
| Gated route | 404; no title/description is rendered, no sitemap entry. |

The helper must never emit `<title></title>`, an empty description, `undefined`, or a raw CMS field without trimming.

### 3.6 Baseline head fields

| Field | Value |
|---|---|
| `lang` | `fr` on the frontend root layout. The admin root layout also uses `fr`. |
| `og:locale` | `fr_FR` (see §4.3 for why not `fr_MA`). |
| `robots` | `index: true`, `follow: true`; `googleBot` adds `max-image-preview: "large"`, `max-snippet: -1`. No `max-video-preview` (no video). |
| `applicationName` | `HAY2010`. |
| `themeColor` | `#F7F6F1` (paper). |
| `colorScheme` | `light` only. No dark mode in v1 ([#4](https://github.com/mustaphaelou/hay2010website/issues/4) §2.2). |
| `viewport` | `width=device-width`, `initialScale: 1`, `viewportFit: "cover"`; no `maximumScale`, no `userScalable: false`. |
| `formatDetection` | `telephone: false`, `email: false`, `address: false`. Prevents iOS auto-linking the address into a map the site has not approved. |
| `appleWebApp` | Omitted. Its default `capable: true` emits `mobile-web-app-capable: yes`; only add with `capable: false` if an iOS title is ever wanted. |
| `manifest` | None. No PWA at launch. |
| `keywords` / `authors` / `publisher` | Not emitted. Google ignores meta keywords; JSON-LD carries the publisher. |
| `referrer` | `origin-when-cross-origin` (privacy default; not a ranking signal). |
| `verification` | Not in the head. DNS TXT at Cloudflare (§6.4). |
| `alternates.languages` | None. French only. |

**Icons.** No Next.js default favicon in production. `app/icon.svg` (the tested badge crop) and `app/apple-icon.png` (180×180) are the metadata; add 16/32 px raster fallbacks only if the crop survives them. The full badge at 16 px is a mush; test before shipping ([#4](https://github.com/mustaphaelou/hay2010website/issues/4) §2.1). The icon assets are gated by [#4](https://github.com/mustaphaelou/hay2010website/issues/4); until they exist, no placeholder icon.

**Viewport export.** `themeColor` and `colorScheme` live in the `viewport` export, not `metadata`: Next.js deprecated them in `metadata` in v14 and the docs still mark them deprecated in 16.4.3. `viewport` cannot stream; keep it static.

### 3.7 Next.js 16 implementation notes

- `metadata` and `generateMetadata` are Server Component exports only; `generateMetadata` receives **Promise** `params`/`searchParams` and must await them.
- `title.template` requires `title.default` and does not apply to the segment that declares it, nor inside `page.tsx`. The homepage therefore uses `title.absolute`.
- **Metadata merging is shallow.** A page that returns `openGraph: { title }` replaces the parent's `openGraph` object, dropping inherited `images` and `description`. `lib/seo.ts` must always return the full `openGraph` and `twitter` objects (title, description, url, siteName, locale, type, images with width/height/type/alt).
- **File-based metadata wins over code.** Do not add `app/opengraph-image.jpg` or `app/twitter-image.jpg`: a root file would override every page's `openGraph.images` and remove the option of a per-record cover later. The default card lives in `public/og/` and is set in code.
- `themeColor`, `colorScheme` and `viewport` in `metadata` are deprecated; use the `viewport` export.
- `robots` uses `index: false`/`follow: false`; the `noindex`/`nofollow` keys are typed `never`.
- `metadataBase` is required; see §2.4.
- Public pages are static/ISR with metadata resolved at build/revalidate, so streaming metadata is not a launch issue. If a page ever uses runtime-only `generateMetadata`, the default HTML-limited bot list covers Google, Bingbot, Twitterbot and Slackbot, but not every link-preview bot; extend `htmlLimitedBots` for LinkedIn/WhatsApp/Telegram rather than moving OG tags into the body.
- `headers()` must be limited to `/admin`, `/api` and `/preview`; staging's noindex header covers every response.
- `proxy.ts` (Next 16's renamed middleware) handles 410s and query cleanup; `next.config.ts` handles the 301 map. Redirects run **before** the proxy, so a legacy 301 wins over a proxy rule for the same path; that is intended for the 301 map.

### 3.8 Admin and preview

- `/admin` and `/api` are developer surfaces: `robots: { index: false, follow: false }` on the admin layout, `X-Robots-Tag: noindex, nofollow` on the route, `Disallow: /admin` and `Disallow: /api/` in production robots, no sitemap entry, no link from the public site.
- Preview uses Next.js draft mode with a signed URL, authenticated, `noindex`, not in the sitemap, and never linked publicly.
- A gated page is not "noindex but reachable": it returns 404 and is absent from the sitemap and internal links. That is stronger and avoids accidental indexing.

---

## 4. Open Graph and Twitter

### 4.1 Default share card

One static card for the whole site at launch:

| Property | Value |
|---|---|
| File | `public/og/hay2010-default.jpg` |
| Size | **1200 × 630**, sRGB, JPEG quality ~85, under 300 KB |
| Background | Ink `#111217` |
| Foreground | Paper `#F7F6F1`; one orange rule `#E97425` |
| Wordmark | `HAY2010` as **text** in Poppins 300 (the wordmark is not the badge artwork) |
| Line | `Éclairage public · Réseaux HTA/MT · CFO/CFA` |
| Footer | `hay2010.ma` bottom-right, small |
| Safe margins | At least 64 px from every edge; no text in the bottom 60 px |
| Alt text | `HAY2010 — éclairage public et électrification à Rabat` |
| Credit | None on the card; the image is company-owned |

**No badge artwork in the card at launch.** The owner approved the vector for web use, but written ownership confirmation is still open ([#4](https://github.com/mustaphaelou/hay2010website/issues/4) §2.1, [#3](https://github.com/mustaphaelou/hay2010website/issues/3) §3). The wordmark text is the brand name, which is confirmed. When ownership is confirmed, a badge variant can be added; it is not a launch requirement.

**No photography in the card at launch.** No licensed, rights-cleared photo exists; the card is typographic, matching the typographic hero fallback. Replace it with a photo version only after the shoot and licence.

**No Porto demo asset, no `ct-logo*.png`, no stock image, no AI-generated people.** The current WordPress `og:image` is the Porto dark logo — never reuse it.

### 4.2 Implementation

Use code, not a root file convention:

```ts
const OG = {
  url: new URL("/og/hay2010-default.jpg", SITE_URL).toString(),
  width: 1200,
  height: 630,
  type: "image/jpeg",
  alt: "HAY2010 — éclairage public et électrification à Rabat",
}
```

Every page's `openGraph.images` and `twitter.images` include this descriptor, unless a rights-cleared per-record image exists. The helper must re-spread the default into every page because Next's merge is shallow.

- `og:site_name`: `HAY2010`.
- `og:title`: the resolved page title, same as `<title>`; set explicitly, do not rely on fallback.
- `og:description`: the meta description, same value; set explicitly.
- `og:url`: the canonical absolute URL.
- `og:type`: `website` for all launch pages and case studies; `article` for a live communiqué. A case study is a project page, not an article.
- `og:locale`: `fr_FR`; no `og:locale:alternate` (French only).
- `og:image:type`, `:width`, `:height`, `:alt`: emitted by the descriptor.
- `twitter:card`: `summary_large_image`.
- `twitter:title`, `:description`, `:image`, `:image:alt`: same values.
- `twitter:site` / `twitter:creator`: **none**. No official account is confirmed; do not invent a handle.
- `og:determiner`: none.
- `og:video` / `og:audio`: none.
- `article:published_time` / `article:modified_time`: ISO 8601, only for a published communiqué.
- `article:author`: omit; there is no person profile URL. The Organization is the author in JSON-LD.
- `article:section` / `article:tag`: omit; the content model has no categories or tags.

### 4.3 Why `fr_FR`, not `fr_MA`

The Open Graph spec requires `language_TERRITORY`; `fr_MA` is format-valid. The main consumers' accepted-locale lists have historically included `fr_FR` and `fr_CA` but not `fr_MA`; an unrecognised locale is ignored or can degrade the preview. `fr_FR` is the supported French fallback and is not a claim about the audience's country. The document language remains `<html lang="fr">` and JSON-LD `inLanguage: "fr"`. If a consumer confirms `fr_MA` support later, switching is a one-line change.

### 4.4 Per-page cards

At launch: **default card only**. No per-page card for `/entreprise`, `/metiers`, `/contact` or the legal pages; a single consistent card is better than six near-identical typographic variants.

When the gated content goes live:

- A communiqué or case study may use its rights-cleared cover, cropped to 1200×630, with an alt from the media record.
- If no rights-cleared image exists, the default card is used.
- No dynamic `ImageResponse` at launch: it adds a runtime route, font loading and a 500 KB bundle for no launch benefit. Static files are cached at the edge.
- The media rights gate applies to the OG image exactly as to an on-page image: `rightsStatus=cleared`; people need releases; client marks need both permissions.

### 4.5 Caching and verification

- The card is a static file under `public/`; Cloudflare caches it aggressively. Use a versioned filename when it changes (`hay2010-default-v2.jpg`) or purge the cache on deploy.
- Verify after launch with Facebook Sharing Debugger, LinkedIn Post Inspector, the X card validator and a WhatsApp link preview. Re-scrape if a cached old card appears.
- The image must be crawlable, absolute, HTTPS and not behind Cloudflare Access. Staging never publishes a card.

---

## 5. Structured data

### 5.1 Entity decision: `Organization`, not LocalBusiness

`ElectricalContractor` is **not a schema.org type** (the URL returns 404). The closest LocalBusiness subtype is [`Electrician`](https://schema.org/Electrician). The ticket's `Organization/LocalBusiness/ElectricalContractor` framing is corrected accordingly.

At launch the site publishes **`Organization` only**:

- The registered seat is approved as an address, but the owner has **not** confirmed a public reception point, opening hours or a phone; the map is gated by `mapLive` ([#3](https://github.com/mustaphaelou/hay2010website/issues/3) §2.3).
- Google's LocalBusiness guidance requires `name` + `address`, but recommends `telephone`, `geo`, `openingHoursSpecification`, `priceRange`, `url` and `image`. A LocalBusiness with only two fields is weak, and it implies a customer-facing place of business the company has not confirmed.
- There is no Google Business Profile. Claiming a local storefront without one invites a knowledge-panel mismatch.
- `Organization` is truthful, supports the entity/legal identity, and can be upgraded later without changing URLs.

**Revisit `Electrician` only when all of these are true:** the owner confirms the address is a public reception point, a phone number is approved, opening hours are confirmed, a Google Business Profile exists, and the facts register is amended. At that point use `@type: ["Organization", "Electrician"]` on `/contact` or `/entreprise` (not the homepage only), with `name`, `address`, `telephone`, `openingHoursSpecification`, `areaServed` and `url`. Until then, no `LocalBusiness`/`Electrician` markup.

### 5.2 `Organization`

Every page's graph includes the same Organization node. Values come from `lib/company.ts`; no CMS field can override them.

```json
{
  "@type": "Organization",
  "@id": "https://hay2010.ma/#organization",
  "name": "HAY2010",
  "alternateName": ["HAY 2010"],
  "legalName": "SOCIETE HAY 2010",
  "url": "https://hay2010.ma",
  "email": "contact@hay2010.ma",
  "description": "Depuis plus de 10 ans, HAY2010 accompagne les collectivités et les entreprises dans leurs projets d’éclairage public et d’électrification.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Local N° 21, Hay El Manzeh, Hay Er-Riad",
    "addressLocality": "Rabat",
    "addressCountry": "MA"
  },
  "identifier": [
    { "@type": "PropertyValue", "name": "RC", "value": "87305" },
    { "@type": "PropertyValue", "name": "ICE", "value": "001459327000056" }
  ],
  "knowsAbout": [
    "Éclairage public",
    "Réseaux HTA/MT & MT/BT",
    "Postes de transformation",
    "CFO/CFA"
  ]
}
```

**Omitted deliberately:** `foundingDate` (no year), `telephone` (gated), `sameAs` (no confirmed accounts), `logo` (ownership open), `numberOfEmployees`, `awards`, `aggregateRating`, `review`, `areaServed`, `geo`, `openingHours`, `priceRange`, `hasOfferCatalog`, `employee`, `founder`, `legalRepresentative`, `legalAddress`, `contactPoint`, `vatID`, `taxID`, `duns`, `iso6523Code`, `naics`, `isicV4`, `slogan`, `image`, `brand`. None is required by Google; several are gated or unsafe.

- `email` is **`contact@hay2010.ma` only**. Never `donnees@`, `recrutement@`, the Gmail, or a placeholder.
- `address` is the approved registered seat. `addressRegion`/`postalCode` are omitted because the approved identity block does not specify them; do not guess.
- `alternateName` is the registry short form `HAY 2010`; `legalName` is `SOCIETE HAY 2010`. Do not use `HAY 2010 SARL` as the dénomination.
- `description` is the approved positioning line; do not add "depuis 2004/2011", "leader", "certifié ISO", "entreprise agréée" or a service list with Solaire.
- `knowsAbout` lists only the four approved services. It is not a claim of a certification, a service area, a price or a project. Solaire is excluded until `solaireLive`.
- `identifier` uses the RC and ICE as `PropertyValue`; this is the approved §5.5 shape. Do not add the IF, old RC, old capital or old address.

### 5.3 `WebSite` — homepage only

Google's site-name feature expects `WebSite` on the homepage, with `name` and `url`; `alternateName` is optional and useful when the primary name is not chosen. One `WebSite` node only, nested in the same graph as the homepage's Organization; do not emit a second block. `og:site_name` and the homepage `<title>` also say `HAY2010`.

```json
{
  "@type": "WebSite",
  "@id": "https://hay2010.ma/#website",
  "url": "https://hay2010.ma",
  "name": "HAY2010",
  "alternateName": ["HAY 2010"],
  "inLanguage": "fr",
  "publisher": { "@id": "https://hay2010.ma/#organization" }
}
```

No `potentialAction`/`SearchAction`: the site has no search ([#2](https://github.com/mustaphaelou/hay2010website/issues/2)). No `description` ("My WordPress Blog" in the current site is a demo tagline and must not survive).

### 5.4 `WebPage` per page

```json
{
  "@type": "WebPage",
  "@id": "https://hay2010.ma/metiers/#webpage",
  "url": "https://hay2010.ma/metiers",
  "name": "Éclairage public, réseaux HTA/MT et CFO/CFA — HAY2010",
  "isPartOf": "https://hay2010.ma",
  "about": { "@id": "https://hay2010.ma/#organization" },
  "inLanguage": "fr"
}
```

- `@id` is the canonical URL plus `#webpage`; `url` is the canonical, no slash.
- `name` is the resolved `<title>`.
- `isPartOf` is the site URL as a URL value, because `WebSite` is only emitted on the homepage; this avoids a dangling cross-page `@id`.
- `about` references the Organization in the same graph.
- Subtypes where they are accurate: `AboutPage` for `/entreprise`, `ContactPage` for `/contact`, `CollectionPage` for `/realisations` (and `/actualites`/`/mediatheque` when live). Everything else is `WebPage`.
- `dateModified` is optional and only from a real CMS `updatedAt` or legal `lastReviewed`; never a build timestamp.
- No `primaryImageOfPage`, `breadcrumb`, `potentialAction`, `significantLink` or `speakable` at launch.

### 5.5 `Article` — only for a live communiqué

```json
{
  "@type": "Article",
  "@id": "https://hay2010.ma/actualites/slug#article",
  "headline": "…",
  "description": "…",
  "datePublished": "2026-11-09T00:00:00.000Z",
  "dateModified": "2026-11-09T00:00:00.000Z",
  "author": { "@id": "https://hay2010.ma/#organization" },
  "publisher": { "@id": "https://hay2010.ma/#organization" },
  "mainEntityOfPage": "https://hay2010.ma/actualites/slug",
  "image": ["https://hay2010.ma/…"],
  "inLanguage": "fr"
}
```

- `Article`, not `NewsArticle`: these are company announcements, not journalism; `NewsArticle` would imply an editorial news operation and pull in the loi 88-13 analysis the content model deliberately avoids ([#5](https://github.com/mustaphaelou/hay2010website/issues/5) §9.1).
- `headline` matches the visible H1; `description` matches the meta description or excerpt.
- `image` only when a rights-cleared cover exists; otherwise omit. Do not use the default OG card as the article image.
- `author`/`publisher` are the Organization, not a person. The gérant is not a public author.
- `datePublished`/`dateModified` come from Payload; no invented dates.
- A case study uses `WebPage`, not `Article`, unless it is written as a dated editorial piece; it never uses `Review` or `AggregateRating`.

### 5.6 Graph and placement

One native `<script type="application/ld+json">` per page with a single `@graph`:

- **Organization** — every page.
- **WebSite** — homepage only.
- **WebPage** — every page, with the right subtype.
- **Article** — the live article page; not the listing.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://hay2010.ma/#organization", "name": "HAY2010" },
    { "@type": "WebPage", "@id": "https://hay2010.ma/metiers/#webpage", "url": "https://hay2010.ma/metiers" }
  ]
}
```

The snippet is abridged to show the graph shape; the full nodes are in §5.2 and §5.4.

Implementation:

```tsx
// components/seo/json-ld.tsx (Server Component)
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data)
          .replace(/</g, "\\u003c")
          .replace(/\u2028/g, "\\u2028")
          .replace(/\u2029/g, "\\u2029"),
      }}
    />
  )
}
```

- Use a native `<script>`, not `next/script`; JSON-LD is data, not executable code. Next has no JSON-LD field in the Metadata API.
- Sanitize `<`, U+2028 and U+2029. CMS article titles/descriptions are user-controlled; `JSON.stringify` does not escape `<`.
- Do not interpolate HTML or JSON strings by hand; build a typed object.
- One graph block avoids duplicate Organization/WebSite nodes. If a component needs a second block for a page-specific type, merge it into the same `@graph`.
- If a CSP is introduced later, allow the inline JSON-LD via nonce/hash; do not add `unsafe-inline` just for it.

### 5.7 What not to add at launch

| Type / property | Why not |
|---|---|
| `LocalBusiness`, `Electrician`, `ProfessionalService` | No confirmed public reception, phone, hours or GBP; see §5.1. |
| `JobPosting` | Google's content policy prohibits it on listing pages; the only jobs page is a listing and `/carrieres/[slug]` does not exist at launch. Revisit with phase-2 detail pages. |
| `BreadcrumbList` | No visible breadcrumb UI at launch; markup must match visible content. Add when #13 introduces breadcrumbs. |
| `Review`, `AggregateRating`, `Rating` | No testimonials or reviews with permission; the facts register gates them. |
| `Service`, `OfferCatalog`, `Offer`, `Product` | No prices, no e-commerce, no confirmed service area; `knowsAbout` is the approved lightweight alternative. |
| `FAQPage`, `HowTo`, `Event`, `Person` | No matching content; the gérant is name-only. |
| `sameAs` | No official social account. The current `https://x.com/` placeholder is a defect; never carry it over. |
| `logo` | Written ownership confirmation is still open; add only after it, with a crawlable 112×112+ image on a white background. |
| `telephone` | Not confirmed; a wrong number is worse than none. |
| `foundingDate` / `awards` / `numberOfEmployees` | Gated or unverified. |
| `areaServed` | Base is Rabat; national/regional coverage is not confirmed. Add only from an amended facts register. |
| `SearchAction` / sitelinks search box | No site search. |
| `article:author` / `Person` | No public author profile; the Organization is the author. |

### 5.8 Future `LocalBusiness` (not now)

When §5.1's conditions are met, add `Electrician` on `/contact` or `/entreprise` (not every page) with `name`, `address`, `email`, `telephone`, `url`, `openingHoursSpecification`, `areaServed` and a square logo. Do not add `priceRange` unless the owner publishes one; do not add `review` without a permission and a visible review. This is a separate change with a facts-register amendment.

### 5.9 Future `JobPosting` (not now)

Only with a dedicated `/carrieres/[slug]` page per job, one `JobPosting` per page, and the required `title`, `description`, `datePosted`, `hiringOrganization`, `jobLocation`, `employmentType` plus `validThrough` and a way to apply. Google explicitly forbids `JobPosting` on a listing page; the current inline `/carrieres` list is a listing. No salary markup unless the salary is visible and approved. The content model already reserves job slugs for phase 2 ([#5](https://github.com/mustaphaelou/hay2010website/issues/5) §5.2).

### 5.10 Validation

- Parse the rendered JSON-LD in a test; assert one `@graph`, the expected types per route, stable `@id`s, and no gated property.
- Run the [Schema Markup Validator](https://validator.schema.org/) for syntax and the [Rich Results Test](https://search.google.com/test/rich-results) for the features Google supports (site name, Article). Organization/WebPage have no rich result; validity is the goal, not a badge.
- Assert **no** `LocalBusiness`, `JobPosting`, `BreadcrumbList`, `Review`, `AggregateRating`, `sameAs`, `logo`, `telephone`, `foundingDate`, `areaServed`, `donnees@`, `recrutement@`, `ste.hay2010@gmail.com`, `Solaire`, `HTA-BT0`, `RC 517`, `6 000 000`, `4 700 000`, `500 000`, `6580342`.
- Assert exactly one `email` value and that it is `contact@hay2010.ma`.
- Assert `knowsAbout` has the four approved services and no fifth.
- Assert `WebSite` appears only on `/`; `Article` only on a live `/actualites/[slug]`; `WebPage` on every indexable page.

---

## 6. Crawl and discovery

### 6.1 `robots.txt`

`app/robots.ts` generates the file; `next.config.ts`/`proxy.ts` do not hand-write it. It is cached by default; that is fine because it changes only on deploy.

Production:

```txt
User-Agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /preview/

Sitemap: https://hay2010.ma/sitemap.xml
```

Staging:

```txt
User-Agent: *
Disallow: /
```

Rules:

- Do **not** disallow `/_next/`, CSS, JS, images or `/og/`; crawlers need them to render and preview.
- Do **not** disallow the dead `/wp-*`, `/blog`, `/project/*`, `/member/*` or `/category/*` paths. A `Disallow` would prevent crawlers from seeing the 404/410 and could keep the old URLs alive longer. Let the status codes do the work.
- `/admin` and `/api/` are disallowed **and** carry `X-Robots-Tag`/`noindex`; defense in depth, because robots.txt is not a security control.
- No `Crawl-delay` (Google ignores it), no `Host` (Yandex only), no `Request-Rate`/`Clean-param`.
- No `Sitemap:` line on staging; the site is not discoverable.
- The sitemap URL is absolute, HTTPS, apex, `/sitemap.xml`.
- AI crawlers: **allow all at launch** (no named blocks). The site wants to be found and cited; robots.txt is not a security boundary. If the owner later wants to opt out of AI training, add a named block list in a separate decision and keep search/answer crawlers allowed. No `llms.txt`.

### 6.2 `sitemap.xml`

`app/sitemap.ts` returns `MetadataRoute.Sitemap`; one sitemap, no index, no `generateSitemaps` (the site is far below 50,000 URLs).

Launch URLs (8):

| URL | `lastModified` |
|---|---|
| `https://hay2010.ma` | Homepage CMS `updatedAt` |
| `https://hay2010.ma/entreprise` | Global `updatedAt` |
| `https://hay2010.ma/metiers` | Global `updatedAt` |
| `https://hay2010.ma/realisations` | Global `updatedAt` |
| `https://hay2010.ma/carrieres` | Global `updatedAt` |
| `https://hay2010.ma/contact` | Global `updatedAt` |
| `https://hay2010.ma/mentions-legales` | `lastReviewed` |
| `https://hay2010.ma/politique-de-confidentialite` | `lastReviewed` |

When the gates open:

- `/actualites` + each published `/actualites/[slug]` when `actualitesLive` and the record is published/legal-reviewed.
- `/mediatheque` when `mediathequeLive` and at least one approved photo.
- `/realisations/[slug]` when `caseStudiesLive` and at least three approved named case studies.
- Never `/mot-du-gerant` (dropped), `/blog`, `/solaire` (anchor), `/admin`, `/api`, `/preview`, 404s, 410s, redirects, anchors or query URLs.
- Never a `noindex` page. A page is in the sitemap **only if** its canonical route returns 200 and is indexable.

Rules:

- Absolute `https://hay2010.ma` URLs, no trailing slash, no query.
- `lastModified` only from a real `updatedAt`/`lastReviewed`; static pages without a real date omit it. Do not use `new Date()` on every request or build; that destroys lastmod trust and looks like churn.
- No `changeFrequency` or `priority`: Google ignores both; emitting fake values is noise.
- No image/video sitemaps at launch; no `alternates` (French only).
- `sitemap.ts` is a cached route handler; call `revalidatePath("/sitemap.xml")` from Payload's `afterChange`/`afterDelete` hooks alongside the page/homepage/listing revalidation. A publish is not complete until the sitemap reflects it.
- If the CMS is down at build, the sitemap must still render the code-owned routes; CMS entries degrade to absent, not to a 500.
- `robots.txt` points at `/sitemap.xml`; Search Console/Bing get the same URL.

### 6.3 404, 410 and `noindex`

- **404:** `app/not-found.tsx` returns HTTP 404, a branded page, `robots: { index: false, follow: false }`, links to Accueil, Métiers and Contact, no canonical.
- **410:** `proxy.ts` returns HTTP 410 with a minimal branded HTML body, `X-Robots-Tag: noindex`, no canonical, links to the homepage. 410 is used for demo content and archives that will never come back (see §7).
- **Gated routes:** 404, not 410 and not a "coming soon" page. A gate is not a permanent deletion; when it opens, the same URL returns 200. `/actualites`, `/mediatheque`, `/realisations/[slug]` and `/mot-du-gerant` follow this.
- **Noindex:** `/admin`, `/api`, `/preview` and 404s. Do not use `noindex` for gated public routes; 404 is stronger and avoids the "indexed but hidden" failure.
- **`X-Robots-Tag`:** set on `/admin`, `/api/`, `/preview/` and every staging response. Do not set it on public production pages; use the meta `robots` object there.
- **Redirect responses:** no canonical, no noindex, no HTML body beyond the standard redirect. The target carries the metadata.

### 6.4 Search Console and Bing Webmaster

- Verify the **domain property** for `hay2010.ma` with a **DNS TXT** record at Cloudflare, not a meta tag. The DNS method is owned by the domain, covers the apex and `www`, and does not put a token in the markup. Bing Webmaster uses the same DNS TXT or its own token; add both at #16.
- Do not verify staging. Staging is behind Cloudflare Access and noindex.
- Submit `https://hay2010.ma/sitemap.xml` once the public host is live; confirm `robots.txt` advertises it.
- Search Console is not analytics: no cookie, no script, no consent banner. It does not conflict with [#10](https://github.com/mustaphaelou/hay2010website/issues/10)'s no-analytics launch.
- After launch, monitor Pages/Coverage, Sitemaps, Rich Results, Core Web Vitals and the URL Inspection tool. Set up email alerts to the developer and owner.
- No Google Analytics, GTM, Meta pixel, Plausible/Umami/Matomo or tag manager. Cloudflare Web Analytics is gated by [#10](https://github.com/mustaphaelou/hay2010website/issues/10)/#14 and is not part of this ticket.

### 6.5 Staging, previews and the admin

- Staging: Cloudflare Access on the whole host, `X-Robots-Tag: noindex, nofollow` on every response, `robots.txt` disallow-all, no sitemap advertised, no Search Console verification, no social previews. Canonical self (`https://staging.hay2010.ma`) so a leaked URL cannot consolidate into production; production is the only canonical public origin.
- Preview: authenticated draft mode, signed URL, `noindex`, no sitemap, no public links.
- Admin: `/admin` behind Cloudflare Access at launch, `noindex` meta/header, disallowed, no sitemap. Payload auth remains the application gate.
- Kill the `X-Robots-Tag` and disallow-all robots only in the production environment at #16; do not edit them by hand on the server.
- Cloudflare Access itself returns a login redirect to crawlers; the noindex header is defense in depth, not the only control.

---

## 7. Legacy WordPress migration

### 7.1 What is live today

The current `hay2010.ma` is a Porto/WordPress demo: WordPress 7.1.4, WooCommerce 10.5.3, no SEO plugin. It is not a content source and must not be migrated.

| Type | Count / URLs |
|---|---|
| Pages | 12: `/`, `/company/`, `/services/` + 4 children, `/projects/`, `/contact/`, `/cart/`, `/my-account/`, `/sample-page/` |
| Posts | 7 demo posts (2016 lorem ipsum + 2026 hello-world) |
| Portfolio CPT | 6: `/project/one-lofts/`, `/project/marina-building/`, `/project/okler-mansion/`, `/project/jet-hotels/`, `/project/okler-towers/`, `/project/porto-building/` |
| Member CPT | 2: `/member/john-doe/`, `/member/monica-doe/` |
| Categories | 3: `/category/duis/`, `/category/news/`, `/category/uncategorized/` |
| Author | `/author/elouardi/` |
| Feeds | `/feed/`, `/comments/feed/`, `/feed/atom/`, `/feed/rss2/` |
| WooCommerce | `/shop/` (200, empty), `/cart/`, `/my-account/`; `/checkout/` 404 |
| Sitemaps | `/sitemaps.xml` index; `/post-sitemap1.xml`, `/page-sitemap1.xml`, `/category-sitemap1.xml`; `/sitemaps.xsl`; `/sitemap.xml` is a malformed 187-byte stub with `<loc>//hay2010.ma</loc>` |
| WP internals | `/wp-json/` 200 (open, 697 routes), `/xmlrpc.php` (GET 405, POST 200), `/wp-login.php` 200 and indexable, `/wp-admin/` 302 |
| Archives | `/2026/`, `/2026/02/`, `/2016/07/23/…`, `/page/2/` (duplicate homepage) |
| Search | `/?s=test` 200, noindex |

Head defects to not carry over: empty meta descriptions site-wide; duplicate/conflicting OG and Twitter tags; `og:type` article vs website; `og:url` homepage on non-home URLs; `Organization.name` empty; `sameAs` placeholder `https://x.com/`; `logo` without a URL; `publisher` as the string `elouardi`; malformed BreadcrumbList; protocol-relative favicon; `/blog/` 404 linked from the footer; `lang="fr-FR"` with English copy; `/sitemap.xml` invalid; category-sitemap `lastmod` equal to request time; no security headers.

### 7.2 301 map — equivalents that keep value

Implement in `next.config.ts` with `statusCode: 301` (not `permanent: true`, which emits 308). Include both the slash and no-slash source variants; redirects run before the proxy, and the trailing-slash normaliser may run first, so test the actual hop chain.

| Old URL | New target |
|---|---|
| `/company` / `/company/` | `/entreprise` |
| `/services` / `/services/` | `/metiers` |
| `/services/pre-construction/` | `/metiers` |
| `/services/general-construction/` | `/metiers` |
| `/services/plumbing/` | `/metiers` |
| `/services/painting/` | `/metiers` |
| `/projects` / `/projects/` | `/realisations` |
| `/project` / `/project/` (archive) | `/realisations` |
| `/contact/` | `/contact` (the no-slash path is the new page and must return 200) |
| `/sitemaps.xml` | `/sitemap.xml` |
| `/sitemap_index.xml` | `/sitemap.xml` |
| `/wp-sitemap.xml` | `/sitemap.xml` |
| `/page-sitemap1.xml` | `/sitemap.xml` |
| `/post-sitemap1.xml` | `/sitemap.xml` |
| `/category-sitemap1.xml` | `/sitemap.xml` |
| `/robots.txt/` | `/robots.txt` |
| `/Company/` / `/Company` | `/entreprise` |
| `/SERVICES/` / `/SERVICES` | `/metiers` |
| `/PROJECTS/` / `/PROJECTS` | `/realisations` |
| `/CONTACT/` / `/CONTACT` | `/contact` |
| `/?p=143` | `/` |
| `/?s=*` | `/` (drop the query; implement with `has: [{ type: "query", key: "s" }]` or in `proxy.ts`, never a bare `source: "/"`) |

Every row applies to both the slash and no-slash source variants unless the table shows one form, so the redirect matches before or after Next's trailing-slash normaliser. Do not add a `source: "/contact"` rule: `/contact` is the canonical target and a self-redirect would loop.

The four old `/services/*` children have no equivalent offer; they all go to `/metiers` rather than to a specific anchor. Do not pretend that "plumbing" or "painting" maps to a HAY2010 service; `/metiers` is the honest destination and the page explains the four real services.

### 7.3 410 map — demo content and dead structures

Implement in `proxy.ts`; `next.config.ts` cannot return 410. The response is HTTP 410 with a minimal branded HTML body, `X-Robots-Tag: noindex`, and links home.

| Group | URLs / pattern | Why |
|---|---|---|
| Demo posts | `/2026/02/16/hello-world/`, `/2016/07/22/lorem-ipsum…`, `/2016/07/22/lorem-ipsum…-2/`, `/2016/07/23/lorem-ipsum…-3/`, `/2016/07/23/the-construction-business/`, `/2016/07/23/how-to-grow-your-business/`, `/2016/07/23/consectetur-adipiscing-elit/` | Lorem ipsum; no value |
| Date archives | `/YYYY/`, `/YYYY/MM/`, `/YYYY/MM/DD/` and the post date paths | Demo archive structure |
| Portfolio CPT | `/project/:slug/` for the six demo projects | Demo portfolio; no real case study |
| Member CPT | `/member/john-doe/`, `/member/monica-doe/` | Demo team |
| Categories/tags | `/category/*`, `/tag/*` | Demo taxonomy |
| Author | `/author/*` | Demo author |
| Feeds | `/feed/`, `/comments/feed/`, `/feed/atom/`, `/feed/rss2/` | No RSS |
| WooCommerce | `/shop/`, `/shop/*`, `/cart/`, `/my-account/`, `/checkout/`, `/product/*`, `/product-category/*` | No e-commerce |
| WP assets | `/wp-content/*`, `/wp-includes/*` | Demo assets, not licensed |
| WP sitemap stylesheet | `/sitemaps.xsl` | No stylesheet |
| Filler | `/sample-page/` | Default WordPress filler |
| Search | `?s=*` on any path other than `/`; `/search/*` | No site search |
| Pagination | `/page/2/` and `/page/:n/` at the root | Duplicate homepage; 301 to `/` is also acceptable, but 410 is simpler |
| WP query params | `?p=*` (except `?p=143`), `?page_id=*`, `?cat=*`, `?author=*`, `?m=*`, `?attachment_id=*`, `?preview=*`, `?wc-ajax=*`, `?replytocom=*`, `?share=*`, `?customize_changeset_uuid=*` | Old WP routing |
| Blog | `/blog/`, `/blog/*` | 410 until `actualitesLive`, then 301 to `/actualites` |
| Actualités | `/actualites/` old 404 | The new route is gated; it returns 404 until live. No redirect. |

Rules:

- `/project/` (the archive) is 301 to `/realisations`; `/project/:slug/` (the six demo items) is 410. Match the exact archive before the wildcard.
- `/blog/` is currently 404 but linked from the old footer; the 410 is intentional. When `actualitesLive` opens, change the rule to 301 `/actualites` and add the new page to the sitemap.
- `/page/2/` can be 301 `/` (consolidates the duplicate) instead of 410; choose one and test. The table recommends 410 for consistency with "no pagination at launch"; a 301 is also defensible.
- `/?p=143` is the old home shortlink; 301 to `/`. Other `?p=` values are demo posts; 410.
- Tracking parameters (`utm_*`, `fbclid`, `gclid`, `msclkid`, `igshid`) are **not** 410: return 200, canonical strips the query.
- A 410 page is not a branded 404 clone: it has no navigation beyond a home link, no search, no related content, no canonical.

### 7.4 Edge 404/403 — WordPress internals

At Cloudflare, not in Next:

| Path | Response |
|---|---|
| `/wp-admin/*` | 404 |
| `/wp-json/*` | 404 |
| `/xmlrpc.php` | 404 |
| `/wp-login.php` | 404 |
| `/wp-cron.php`, `/wp-signup.php`, `/wp-activate.php` | 404 |
| `/wp-content/plugins/*`, `/wp-content/themes/*` | 404 |

Do not 301 these. A 301 would advertise the old application and keep the paths discoverable; a 404 removes them. Add the rules before the public cutover and verify with `curl -I` from outside the zone. If a request reaches the origin, `proxy.ts` returns the same 404 as a fallback.

### 7.5 Query strings

Redirects run **before** the proxy, so a 301 from §7.2 wins over a proxy rule. For a legacy 301, Next carries the query string to the target; the canonical tag discards it. For paths not in the 301 map:

- `/?s=...` → 301 to `/` (drop the query). The old search pages are noindex; 301 is cleaner than a 410 for the homepage.
- `?p=143` → 301 to `/`.
- Any other `?p=`, `?page_id=`, `?cat=`, `?author=`, `?m=`, `?attachment_id=`, `?preview=`, `?wc-ajax=`, `?replytocom=`, `?share=`, `?customize_changeset_uuid=` → 410.
- Unknown query parameters on a valid page → 200; canonical strips. Do not blanket-redirect all query strings; tracking parameters are legitimate.
- Percent-encoded variants, `+` vs `%20`, and duplicate parameters → treat as the same path; do not create duplicate 301s. Test a few.
- `/sitemaps.xml/`, `/robots.txt/`, `/sitemap.xml/` and other file-path trailing slashes → 301 to the file path; a file path with a trailing dot segment is not a valid page.

### 7.6 Case variants

The old WordPress serves `/Company/`, `/SERVICES/`, `/PROJECTS/`, `/CONTACT/` with 200 and a self-canonical lowercase. The new site 301s those known variants to the new lowercase route. Do not add a generic "lowercase every path" rule: media filenames and future slugs may be case-sensitive, and a blanket redirect can mask a real 404. Add explicit map entries for the pages that existed.

### 7.7 Implementation order and redirect chains

1. `next.config.ts` `redirects()` with `statusCode: 301` for §7.2. Include slash and no-slash sources. Do not use `permanent: true`.
2. `proxy.ts` for the 410 groups and WP query strings. Matcher: exclude `_next/static`, `_next/image`, `favicon.ico`, `icon`, `apple-icon`, `opengraph-image`, `twitter-image`, `robots.txt`, `sitemap.xml` and files with an extension; otherwise the 410 logic runs on every asset.
3. Cloudflare edge rules for host redirects and WP internals. These run before the origin; they are not a substitute for the origin rules.
4. Verify with `curl -sI` for every row: a 301 that lands on a 200, a 410 with no `Location`, a 404 without a 200 body. Check the number of hops; Cloudflare + Next can create a 308→301 chain on trailing-slash legacy URLs. If the chain matters, add an edge redirect for the legacy slash form or set `skipTrailingSlashRedirect: true` and handle both forms in the proxy. The default is to accept the two-hop permanent chain rather than add a proxy to every request.
5. No redirect to a 404, no redirect loop, no 301 to a URL that 301s again, no 410 on a new route.

### 7.8 Slug and URL changes after launch

- Slugs are **immutable once published**. The owner can edit title, copy and images; changing a slug is a developer change.
- A slug change ships with a 301 from the old path in the same change, plus a sitemap update and an internal-link update. No automatic redirect from a Payload hook; a mistaken slug edit must not silently create a redirect graph.
- The Payload `slug` field is read-only after first publish (or developer-only). The admin shows the old slug and a warning that a change needs a redirect.
- A deleted/archived record that was published 301s to its parent listing if it will never return; a demo record is 410. Do not leave a published URL as a 404 for a URL that had traffic; 301 or 410, not 404.
- The redirect map is code-owned; the owner cannot add arbitrary redirects. New redirects are a developer change, reviewed with the content change.

---

## 8. Keyword targets and on-page rules

### 8.1 Keyword map

French only. No search-volume claim is made; the table is intent-led. The primary phrase goes in the title/H1; the secondary phrases are variations in the body, headings and internal links — not a comma list.

| Page / anchor | Primary | Secondary |
|---|---|---|
| `/` | `éclairage public Rabat` | `entreprise électricité Rabat`, `électrification Rabat`, `travaux électriques Rabat`, `entreprise d’éclairage public` |
| `/entreprise` | `HAY2010` / `SOCIETE HAY 2010` | `entreprise d’électricité Rabat`, `plus de 10 ans d’expérience`, `agrément ONEE EE HTA-BT`, `agrément ONEE HTA-BT3` (only when `agrementLive`) |
| `/metiers#eclairage-public` | `éclairage public` | `travaux d’éclairage public Rabat`, `réseau d’éclairage public`, `maintenance éclairage public` (only if offered) |
| `/metiers#reseaux-hta-mt` | `réseaux HTA` | `lignes MT`, `électrification HTA/BT`, `réseaux MT/BT`, `raccordement HTA` |
| `/metiers#postes-de-transformation` | `poste de transformation` | `poste HTA/BT`, `construction poste de transformation`, `transformation électrique` |
| `/metiers#cfo-cfa` | `CFO CFA` | `courants forts courants faibles`, `installation CFO/CFA`, `câblage courant faible` |
| `/realisations` | `références éclairage public` | `réalisations électricité Rabat`, `agréments ONEE` (when live) |
| `/carrieres` | `offres d’emploi électricité Rabat` | `recrutement éclairage public`, job titles (`électricien HTA`, `chef de chantier éclairage public`, `technicien CFO/CFA`) |
| `/contact` | `contact HAY2010` | `devis éclairage public Rabat`, `adresse HAY2010 Rabat` |

Not targeted at launch:

- `solaire`, `photovoltaïque`, `énergie solaire`, `panneaux solaires` — `solaireLive` is false and the capability is not confirmed ([#3](https://github.com/mustaphaelou/hay2010website/issues/3) §3). When the gate opens, add `installation solaire Rabat`, `photovoltaïque Rabat` only with proof and a facts-register amendment.
- `leader`, `n°1`, `meilleur`, `certifié ISO`, `partenaire officiel`, `entreprise agréée` — gated/unsupported.
- `depuis 2004`, `depuis 2011`, `plus de 20 ans` — contradicted or owner-rejected.
- `RC 517`, `6 000 000`, `4 700 000`, `500 000`, `IF 6580342` — wrong entity/stale.
- `HTA-BT0`, `postes HTA` as an ONEE agrément — belongs to another company.
- Khemisset, client names, aggregator totals, "14 marchés", "78,66 M DH" — no permission/attribution.
- City doorway pages (Casablanca, Fès, etc.) — no confirmed coverage and no content.

### 8.2 Copy and stuffing rules

- Each page has **one** primary intent. Do not chase two unrelated clusters on one page.
- Primary phrase appears once in the title, once in the H1, once in the first 100 words and once in the description. Variations elsewhere; no exact-match repetition beyond that.
- No keyword lists, hidden text, white-on-white text, `display:none` keyword blocks, alt-text stuffing or `meta keywords`.
- No "Découvrez", "Cliquez ici", "En savoir plus" as the only anchor text. Use the service name or the destination.
- No auto-generated city or service permutations. No doorway pages.
- No AI-generated copy published unreviewed; the owner approves the French ([#5](https://github.com/mustaphaelou/hay2010website/issues/5) §8).
- French typography: typographic apostrophes, non-breaking spaces before `: ; ? !`, `« »`, accented capitals.
- Reading level: clear professional French, 45–65 characters per line, no jargon without a gloss.
- Claims: only the facts register §2.2. The forbidden-claims lint covers metadata and copy; a hit blocks the build/publish.

### 8.3 Headings

- Exactly **one H1** per page. No H1 in the header, logo, footer or a card.
- The homepage H1 is the hero headline and contains `éclairage public` and `Rabat` (or `électrification`): default `Éclairage public et électrification à Rabat`. The brand eyebrow/subline can carry the poetic line; the H1 does the query.
- `/metiers` H1 is `Nos Métiers`; the four service blocks are `<h2>` with the exact labels: `Éclairage public`, `Réseaux HTA/MT & MT/BT`, `Postes de transformation`, `CFO/CFA`. Solaire is absent until live.
- `/entreprise` H1 `L’Entreprise`; `/realisations` H1 `Réalisations`; `/carrieres` H1 `Carrières`; `/contact` H1 `Contact`; legal pages H1 `Mentions légales` / `Politique de confidentialité`.
- No skipped levels (H1 → H2 → H3); no heading used only for styling.
- The H1 and the `<title>` are not identical by requirement, but the H1 must contain the page's primary phrase; the title is the keyword-led phrase + brand.

### 8.4 Internal linking and anchors

- Home → four `/metiers#…` anchors, `/entreprise`, `/realisations`, `/carrieres`, `/contact`.
- Nav and footer links are the fixed labels from [#2](https://github.com/mustaphaelou/hay2010website/issues/2); no "Accueil" item (logo = home).
- Footer service column links to the four anchors; legal links in the bottom bar.
- Anchor text is descriptive: `Éclairage public`, `Réseaux HTA/MT & MT/BT`, `Postes de transformation`, `CFO/CFA`; no "En savoir plus" alone. If a card needs a generic CTA, add an `aria-label` with the service.
- `/realisations` links to `/metiers` anchors; `/entreprise` links to `/realisations` and `/contact`.
- No orphan pages: every launch page is reachable from the nav/footer in two clicks.
- External links: only if useful; `rel="noopener"` on new tabs; no paid links; no link schemes.
- The gated pages are not linked anywhere until live; a direct URL returns 404.

### 8.5 Images and alt text

- Every content image has French alt text describing the image, not the keyword; decorative images use `alt=""`.
- No "image de…", no keyword stuffing, no file-name-as-alt.
- Alt text is required by the media model ([#5](https://github.com/mustaphaelou/hay2010website/issues/5) §5.2); an image without alt does not reach the frontend.
- Hero alt describes the scene and, if verified, the place/operation; no client name or logo unless permitted.
- Captions where the image is evidence; credits per the media record.
- No stock, AI-generated people, Porto demo images or unlicensed photography. This is a rights gate and an SEO trust issue.
- `next/image` with width/height to avoid CLS; the OG card is a static file.

### 8.6 No blog / news section at launch

- **No blog, no news index, no RSS, no author/category/tag archives, no comments.**
- `Actualités` is a gated `communiques` stream (max six a year, no journalistic editorial line) and stays 404 until `actualitesLive` and the first counsel-reviewed article ([#5](https://github.com/mustaphaelou/hay2010website/issues/5) §5.2, §9.1).
- The old `/blog/` 404 is not an SEO opportunity; it is a broken demo link. It 410s until Actualités opens, then 301s to `/actualites`.
- A blog is not needed to rank a seven-page corporate site; it adds loi 88-13 and CNDP review burden and thin-content risk. If the owner later wants a real news operation, reopen [#5](https://github.com/mustaphaelou/hay2010website/issues/5) and take counsel before publishing.
- No "Derniers articles" homepage slot at launch; the homepage order in [#2](https://github.com/mustaphaelou/hay2010website/issues/2) has no news teaser.

### 8.7 One-page `/metiers` ceiling

The four services share one page with anchors. That is a deliberate simplification: the company has four related offers and the page is long enough to rank for the umbrella and the service terms, but it cannot rank as strongly as four dedicated pages. Accept the ceiling for launch.

- Revisit only if Search Console shows four distinct query clusters with impressions but poor position after 6–12 months, and the owner can supply enough unique copy and images for four pages.
- Splitting the page is a [#2](https://github.com/mustaphaelou/hay2010website/issues/2) change (routes, nav, sitemap, redirects), not a content edit.
- Do not create thin service pages now, and do not duplicate the four blocks across the site.

### 8.8 Local SEO and Google Business Profile

- Deferred. A GBP needs a phone, a public reception address, hours and owner verification; none is confirmed. Do not create a profile with a placeholder or the private Gmail.
- No map embed (`mapLive` false), no `LocalBusiness` markup, no `sameAs` to a profile, no review request.
- The site still targets `Rabat` in titles/descriptions/H1 where truthful; the registered address is published in the legal pages and `/contact`, not as a storefront.
- When the owner confirms the reception point, phone and hours, amend the facts register first, then add GBP and `Electrician` markup in a separate change. `areaServed` follows the same amendment.
- No city pages, no "zones d'intervention" page, no national claim until the owner confirms coverage.

### 8.9 Forbidden-claims lint

A code-owned list runs over titles, descriptions, OG text, JSON-LD and seeded copy before build/publish. A hit fails, not warns. Minimum patterns:

```text
depuis 2004 | depuis 2011 | créée en 2004 | plus de 20 ans
leader | n°1 | numéro 1 | meilleur | partenaire officiel
entreprise agréée | certifié ISO | ISO 9001 | certifié
RC 517 | 6 000 000 | 4 700 000 | 500 000 | IF 6580342
HTA-BT0 | agrément.*postes HTA | branchements HTA
solaire | photovoltaïque | énergie solaire   (while solaireLive is false)
Khemisset | 187 607 | 78,66 | 14 marchés | 14 appels d'offres
téléphone | Tél. | +212 | 05 37 281111   (while phone is gated)
ste.hay2010@gmail.com | donnees@ | recrutement@   (outside the approved pages/fields)
CNDP n° | récépissé n°   (with an empty/placeholder value)
```

The lint is a backstop, not a substitute for review. A legitimate use (e.g. `donnees@` in the privacy policy, `téléphone` in a sentence saying none is published) needs an allowlist per file/field, not a global exception.

---

## 9. Implementation map

### 9.1 Files

| File | Responsibility |
|---|---|
| `lib/company.ts` | Legal identity, address, `contact@`, approved claims, ONEE wording + `agrementLive`. |
| `lib/flags.ts` | Gates; no SEO field reads a gate except `agrementLive`, `actualitesLive`, `mediathequeLive`, `solaireLive`, `caseStudiesLive`. |
| `lib/seo.ts` | `SITE_URL`, `SITE`, title/description defaults, `buildMetadata`, canonical, OG/Twitter, JSON-LD builders, robots/sitemap helpers. |
| `components/seo/json-ld.tsx` | Native `<script type="application/ld+json">` with sanitisation. |
| `app/(frontend)/layout.tsx` | `metadataBase`, title template, default OG, `viewport`, `lang="fr"`, icons, Organization JSON-LD. |
| `app/(frontend)/page.tsx` | Homepage `title.absolute`, WebSite/WebPage JSON-LD. |
| `app/(frontend)/…/page.tsx` | Per-page `generateMetadata`/`metadata`, WebPage JSON-LD. |
| `app/sitemap.ts` | `MetadataRoute.Sitemap`; the eight routes + gated content when live. |
| `app/robots.ts` | Production/staging rules; sitemap URL. |
| `app/not-found.tsx` | 404, noindex, no canonical. |
| `public/og/hay2010-default.jpg` | Default share card. |
| `app/icon.svg`, `app/apple-icon.png` | Icons; no default favicon. |
| `next.config.ts` | `trailingSlash: false`; 301 redirect map; headers for admin/api/preview; `output: "standalone"` per #8. |
| `proxy.ts` | 410 map, WP query cleanup, case variants, staging noindex header; matcher exclusions. |
| `payload.config.ts` / collections | `seo` group fields, developer-only; revalidation hooks. |
| `scripts/check-seo.ts` | Forbidden-claims lint + title/description length/uniqueness. |

The current repo is the template, so these files do not exist yet. The spec defines them; the build creates them.

### 9.2 `lib/seo.ts` shape

```ts
export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SERVER_URL ?? "https://hay2010.ma"
)

export const SITE = {
  name: "HAY2010",
  legalName: "SOCIETE HAY 2010",
  url: SITE_URL.toString().replace(/\/$/, ""),
  email: "contact@hay2010.ma",
  locale: "fr_FR",
  language: "fr",
  ogImage: {
    url: new URL("/og/hay2010-default.jpg", SITE_URL).toString(),
    width: 1200,
    height: 630,
    type: "image/jpeg",
    alt: "HAY2010 — éclairage public et électrification à Rabat",
  },
} as const

export function absoluteUrl(path: string): string
export function pageMetadata(input: {
  title: string
  description: string
  path: string
  type?: "website" | "article"
  image?: OgImage
  publishedTime?: string
  modifiedTime?: string
  noindex?: boolean
}): Metadata
export function buildOrganization(): OrganizationNode
export function buildWebSite(): WebSiteNode
export function buildWebPage(input: { type?: WebPageType; path: string; name: string; dateModified?: string }): WebPageNode
export function buildArticle(input: { path: string; headline: string; description: string; published: string; modified: string; image?: OgImage }): ArticleNode
export function buildGraph(nodes: GraphNode[]): Graph
export function jsonLd(data: Graph): string
```

Rules for `pageMetadata`:

- Always return the full `openGraph` and `twitter` objects; never a partial object.
- Always set `alternates.canonical` to the path; `metadataBase` resolves it.
- Always set `robots` (index/follow + googleBot) unless `noindex` is passed (admin/preview/404 only).
- Always set the default OG image if `image` is absent.
- Trim and validate title/description; throw on empty or forbidden claims.
- Do not accept a full title with the brand; the helper appends `— HAY2010` once.
- Do not accept a free-form URL for the canonical; only a path, so the host is controlled.
- Do not accept HTML in the description.

### 9.3 `next.config.ts`

- `trailingSlash: false`.
- `output: "standalone"` (from #8).
- `poweredByHeader: false` (not SEO, but no version leak).
- `async redirects()` with `statusCode: 301` for §7.2, both slash variants. No `permanent: true`.
- `async headers()` for `X-Robots-Tag` on `/admin/:path*`, `/api/:path*`, `/preview/:path*`; staging noindex is better handled in `proxy.ts` for all routes.
- Do not put the 410s here; they cannot return 410.
- Do not set `Cache-Control` on HTML; [#8](https://github.com/mustaphaelou/hay2010website/issues/8) keeps HTML uncached at the edge at launch.

### 9.4 `proxy.ts`

- Next 16 renamed `middleware` to `proxy`; use `proxy.ts` and export `proxy` (or default).
- Matcher excludes `_next/static`, `_next/image`, `favicon.ico`, `icon`, `apple-icon`, `opengraph-image`, `twitter-image`, `robots.txt`, `sitemap.xml` and file extensions; otherwise the 410 logic runs on every asset.
- Order: (1) staging noindex header; (2) WP query cleanup; (3) case variants; (4) 410 map; (5) `NextResponse.next()`.
- The 410 response is a small HTML document with `Content-Type: text/html; charset=utf-8`, `X-Robots-Tag: noindex`, no `Location`, no canonical; it links to `/` and `/contact`.
- 301s stay in `next.config.ts`; do not duplicate them in the proxy. Redirects run before the proxy, so the 301 map wins.
- Do not do a DB lookup or CMS fetch in the proxy; it runs on every request. A static map/regex is enough.
- Test with `next/experimental/testing/server` utilities or HTTP tests after build.

### 9.5 `app/robots.ts` and `app/sitemap.ts`

- Both use `SITE.url`; no hardcoded host.
- `robots.ts` branches on `process.env.NEXT_PUBLIC_SERVER_URL === "https://staging.hay2010.ma"` or an explicit `SITE_ENV`; do not infer from `NODE_ENV` (staging also runs production builds).
- `sitemap.ts` reads the content adapter; if a CMS record is absent, the route still renders the static entries. It never throws a 500 for one missing record.
- `revalidatePath("/sitemap.xml")` after publish; `sitemap.ts` is cached.
- `robots.ts` has no sitemap line on staging.
- Both are public, not behind Access on production; on staging, Access still protects them, and robots is disallow-all.

### 9.6 Environment

| Variable | Use |
|---|---|
| `NEXT_PUBLIC_SERVER_URL` | Canonical origin, `metadataBase`, sitemap/robots, JSON-LD `url`, OG URLs. |
| `SITE_ENV` (optional) | `production` / `staging` for robots/noindex; or compare the host. |
| `FORMS_ENABLED` | Not SEO; forms are #12. |
| No SEO token | Search Console/Bing tokens are DNS, not env. |

- `NEXT_PUBLIC_SERVER_URL` must be set per environment and included in the build. A missing value defaults to `https://hay2010.ma`; it must never default to localhost.
- The production and staging builds must not share a prebuilt image with the wrong host. Rebuild at #16, or pass the host at runtime only if the metadata can be dynamic; the simpler and safer path is a rebuild.

### 9.7 Revalidation

- Publish/update: `revalidateTag` for the content, `revalidatePath` for the page, homepage, listing, `/sitemap.xml` and any page whose card/description changed.
- Delete/unpublish: the page 404s (or 301/410 as decided), the sitemap drops it, internal links are removed; preview the result.
- Job expiry: the daily revalidation from #8 also refreshes `/carrieres`; no `JobPosting` at launch.
- Slug change: a code redirect is added in the same deploy; the sitemap updates; no automatic hook.
- Legal review: `lastReviewed` changes update the sitemap `lastModified` and the visible date; the metadata description does not claim a CNDP number.

---

## 10. Tests and launch gates

### 10.1 Automated

- **Title/description:** every launch route has a non-empty title ≤ 65 chars with exactly one `— HAY2010`; description 120–160 chars (warn outside 140–160); all titles and descriptions unique; no forbidden claims; no empty/`undefined`.
- **Canonical:** absolute, apex, HTTPS, no `www`, no trailing slash, no query; homepage canonical `https://hay2010.ma`; no canonical on 404/410.
- **OG/Twitter:** absolute 1200×630 JPEG, alt present, `og:site_name` HAY2010, `og:type` website/article, `twitter:card` summary_large_image, no site/creator handle, no Porto logo.
- **JSON-LD:** one `@graph`, expected types, stable `@id`s, `email` contact@ only, `knowsAbout` four services, no gated properties (the list in §5.10), `WebSite` only home, `Article` only live article.
- **Sitemap:** exactly the eight launch URLs; no gated/redirect/410/query/anchor/admin; absolute; no trailing slash; `lastmod` real or absent; after a gate flip, the new route appears.
- **Robots:** production allow + admin/api/preview disallow + sitemap; staging disallow-all; no `Disallow: /wp-`; no `/_next/` disallow.
- **Redirects:** table-driven 301/410/404; no chain/loop; 301 target 200; 410 no `Location`; query handling; case variants; trailing slash; WP internals 404.
- **Headers:** `X-Robots-Tag` on admin/api/preview/staging; absent on public pages; `noindex` meta on 404/admin.
- **Language/viewport:** `lang="fr"`, `og:locale fr_FR`, `inLanguage: "fr"`, `color-scheme: light`, `theme-color #F7F6F1`, no dark-mode metadata, no `maximum-scale=1`, no `user-scalable=no`.
- **No third-party:** no GA/GTM/pixel/analytics script; no `next/script` for analytics; no `llms.txt`.
- **Build:** `npm run typecheck`, `npm run lint`, `npm run build`; a route/head snapshot for `/`, `/entreprise`, `/metiers`, `/realisations`, `/carrieres`, `/contact`, both legal pages and 404.
- **Content lint:** forbidden claims in metadata and seeded copy; no `Solaire`/`HTA-BT0`/`RC 517`/old capital/old address/phone/Gmail.
- **Media:** OG image exists, is 1200×630, under 300 KB, JPEG, sRGB; icons exist at the tested sizes; no default Next favicon; no Porto asset.

### 10.2 Manual

- [Rich Results Test](https://search.google.com/test/rich-results) on `/` and a live article: no errors; site name/Article as applicable.
- [Schema Markup Validator](https://validator.schema.org/) on `/`, `/entreprise`, `/contact`, a legal page: no syntax errors; no gated properties.
- Facebook Sharing Debugger, LinkedIn Post Inspector, X card validator, WhatsApp preview: card renders, title/description correct, no old logo, no localhost.
- Search Console URL Inspection on `/`, `/metiers`, `/contact`, one legal page: canonical matches, robots index, no mobile usability issue.
- `curl -sI` on every redirect/410 row; `curl -s` on `/robots.txt`, `/sitemap.xml`, `/?s=test`, `/?p=81`, `/wp-login.php`, `/wp-json/`, `/blog/`, `/shop/`, `/project/one-lofts/`, `/member/john-doe/`, `/category/news/`, `/author/elouardi/`, `/?p=143`.
- Visual: `lang` in DevTools, no duplicate meta tags, one title/description/canonical/og set, one JSON-LD block, no `meta keywords`.
- Mobile: title/description truncation is acceptable; no horizontal scroll from the OG test page (none).
- Accessibility: one H1, heading order, descriptive links, alt text, focus states (from #4/#13).

### 10.3 Launch gates (#16)

- [ ] Apex `https://hay2010.ma` serves 200; `www` and `http` 301 in one hop or an accepted permanent chain.
- [ ] No trailing-slash duplicate returns 200; canonical matches the served URL; no uppercase duplicate returns 200.
- [ ] Every launch page has a unique title and description; no empty; no forbidden claim; no placeholder.
- [ ] The Organization/WebSite/WebPage JSON-LD validates; no LocalBusiness/JobPosting/sameAs/logo/phone/foundingDate/areaServed; `email` is `contact@`.
- [ ] The default OG card renders in the four preview tools; no Porto/old logo; 1200×630; alt present.
- [ ] `/robots.txt` is production-correct; `/sitemap.xml` has the eight URLs and no gated route; staging is disallow-all and noindex.
- [ ] Search Console and Bing Webmaster are verified by DNS TXT; the sitemap is submitted; no analytics.
- [ ] The entire legacy map is verified: 301 targets 200; 410s return 410; WP internals 404; no `/wp-login.php`/`/wp-json/`/`/xmlrpc.php` 200; `/blog/` not 200; `/shop/` not 200.
- [ ] `contact@` and `donnees@` pass the send/receive test before they appear in metadata; `recrutement@` is not public before #14.
- [ ] Legal pages are indexable, use the approved identity block, and have no CNDP blank, no phone, no host line, no publication director.
- [ ] `lang="fr"`, light only, `theme-color` paper, `format-detection` off; no dark-mode tags.
- [ ] No GA/GTM/pixel/analytics; no cookie banner; no newsletter/RSS.
- [ ] Gated routes (`/actualites`, `/mediatheque`, `/realisations/[slug]`, `/mot-du-gerant`) return 404 and are absent from nav/footer/sitemap.
- [ ] The public site is served without Cloudflare Access on production; `/admin*` remains behind Access; staging remains behind Access and noindex.
- [ ] No client name/logo, employee photo, testimonial, Khemisset/aggregator total or expired MHVP qualification in metadata or JSON-LD.

### 10.4 Maintenance

- On every publish: revalidate the page/homepage/listing/sitemap; check title/description if copy changed; no empty field.
- On a gate flip: update the sitemap, internal links, JSON-LD and robots expectations; deploy; re-test the now-public route.
- On a slug change: developer-only 301 + sitemap + internal links + tests; never an automatic redirect.
- On a new service (e.g. Solaire): facts register first, then `lib/company.ts`/`lib/flags.ts`, nav, sitemap, JSON-LD, keywords; no keywords before proof.
- Quarterly: Search Console Pages/Coverage, Sitemaps, Rich Results, Core Web Vitals; broken-link check; redirect map audit; forbidden-claim lint; OG card preview re-scrape.
- After a Next.js/Payload upgrade: run the metadata/JSON-LD/sitemap/redirect tests; check the Next metadata API changes (especially `proxy.ts`, `params` promises, `title.template`, `metadataBase`).
- After a Cloudflare rule change: re-test host redirects, WP internals, cache/canonical, staging noindex.
- Keep the redirect map in code and reviewed; no redirects added in the Cloudflare dashboard only, or the map drifts.

---

## 11. Open items and owner actions

| # | Action | Unlocks | Owner |
|---|---|---|---|
| 1 | Confirm the OG card design and produce `public/og/hay2010-default.jpg` (1200×630, text-only wordmark) | Share previews | Build/design |
| 2 | Confirm logo ownership in writing; produce the tested favicon crop and 180 px Apple icon | JSON-LD `logo`, icon metadata, badge OG variant | Owner + design |
| 3 | Run the mailbox send/receive tests for `contact@` and `donnees@` | Contact/policy descriptions with emails | Owner ([#10](https://github.com/mustaphaelou/hay2010website/issues/10) §6) |
| 4 | File both ONEE certificates | `agrementLive` descriptions and JSON-LD | Owner ([#3](https://github.com/mustaphaelou/hay2010website/issues/3) §8) |
| 5 | Confirm phone, public reception, hours and a GBP, or confirm they stay omitted | Future LocalBusiness/`areaServed`/contact metadata | Owner |
| 6 | Confirm any official social accounts, or confirm none permanently | Future `sameAs` and social links | Owner |
| 7 | Approve the exact title/description table in §3.3 before the build freezes copy | Metadata implementation | Owner |
| 8 | Provide the Google/Bing DNS verification tokens at #16 | Search Console/Bing | Owner/developer |
| 9 | Decide whether to block AI training crawlers after launch | `robots.ts` policy | Owner |
| 10 | If national/regional coverage is confirmed, amend the facts register first | `areaServed`, keyword map, copy | Owner |

The current defaults assume no phone, no social, no GBP, no public reception, no Solaire, no agrément publication and no blog. Every one of those is a gate, not a permanent "no".

---

## 12. Sources

- **Next.js 16.4.3 bundled docs** — `node_modules/next/dist/docs/01-app/`:
  - `03-api-reference/04-functions/generate-metadata.md` (metadata fields, `metadataBase` 391–464, `robots` 551–579, streaming 1240–1270, merge 1336–1436)
  - `03-api-reference/04-functions/generate-viewport.md` (`themeColor`/`colorScheme`, no streaming)
  - `03-api-reference/03-file-conventions/01-metadata/sitemap.md` and `robots.md`
  - `03-api-reference/03-file-conventions/01-metadata/opengraph-image.md` (file-based priority, sizes, alt)
  - `03-api-reference/03-file-conventions/proxy.md` (execution order 236–243)
  - `03-api-reference/05-config/01-next-config-js/redirects.md` (`statusCode` vs `permanent`), `skipTrailingSlashRedirect.md`, `trailingSlash.md`
  - `02-guides/json-ld.md` (native script, sanitise `<`)
  - `02-guides/upgrading/version-16.md` (async `params`/`id`, proxy rename)
- **Google Search Central** — [Organization](https://developers.google.com/search/docs/appearance/structured-data/organization), [LocalBusiness](https://developers.google.com/search/docs/appearance/structured-data/local-business), [site names](https://developers.google.com/search/docs/appearance/site-names), [JobPosting](https://developers.google.com/search/docs/appearance/structured-data/job-posting) (all retrieved 2026-11-09; pages last updated 2026-09-15/2026-02-20).
- **schema.org** — [Electrician](https://schema.org/Electrician); `https://schema.org/ElectricalContractor` returns 404 (verified 2026-11-09).
- **Open Graph protocol** — https://ogp.me/ (required `og:title`, `og:type`, `og:image`, `og:url`; `og:locale` `language_TERRITORY`; `og:image:alt`).
- **Current WordPress inventory** — `hay2010.ma`, live 2026-11-09: 12 pages, 7 posts, 6 portfolio CPT, 2 member CPT, 3 categories, 3 sitemap children, `/sitemap.xml` malformed, `/sitemaps.xml` index, `/blog/` 404, `/shop/` empty, `/wp-login.php` 200/indexable, `/wp-json/` open, empty descriptions and duplicate OG tags. Read-only audit; nothing modified.
- **Project docs** — [`docs/company/facts-register.md`](../company/facts-register.md), [`docs/content/content-model.md`](../content/content-model.md), [`docs/content/realisations-strategy.md`](../content/realisations-strategy.md), [`docs/brand/brand-direction.md`](../brand/brand-direction.md), [`docs/hosting/deployment-decision.md`](../hosting/deployment-decision.md), [`docs/legal/analytics-consent-legal-pages.md`](../legal/analytics-consent-legal-pages.md), [`docs/forms/contact-careers-forms.md`](../forms/contact-careers-forms.md), [`.scratch/hay2010-website/issues/01-page-tree.md`](../../.scratch/hay2010-website/issues/01-page-tree.md).

---

## 13. Change log

| Date | Change |
|---|---|
| 2026-11-09 | Initial decision: apex/no-slash canonical, 301/308 policy, code-owned metadata, title/description table, fr/fr_FR, Organization + WebSite + WebPage JSON-LD, typographic OG card, robots/sitemap rules, full WordPress redirect/410 map, keyword map, no blog, spec-only deliverable. |
| 2026-11-09 | #12 form flags added to the `lib/flags.ts` inventory: `applicationFormLive`, `cvUploadLive` (both false); no `JobPosting` and no new indexable form URL. |
