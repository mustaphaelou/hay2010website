# Specify SEO, metadata and structured data

Type: grilling
Status: resolved 2026-11-09
Blocked by: 01, 02

## Question

What are the SEO and metadata rules for the site?

Decide:

- Title/description patterns per page (lamalif uses "Page | Company").
- Canonical host (apex vs `www`), trailing-slash policy, canonical URLs, sitemap.xml and robots.txt, aligned with the hosting redirect map.
- Open Graph/Twitter images and default share card.
- JSON-LD: Organization/LocalBusiness/ElectricalContractor, address, area served, services, sameAs social links.
- French keyword targets for each service (éclairage public, lignes MT, postes de transformation, CFO/CFA, solaire) without keyword stuffing.
- Handling of the current hay2010.ma WordPress URLs and any legacy content.
- Whether to keep a blog/news section for SEO at launch.

## Answer

Resolved 2026-11-09 by a grilling session with the owner; all recommended answers accepted. Full decision record, exact copy, JSON-LD, redirect map and launch gates: [`docs/seo/seo-metadata.md`](../../../docs/seo/seo-metadata.md).

- **Canonical:** `https://hay2010.ma`, apex/HTTPS/no trailing slash; `www` and `http` 301 at Cloudflare; explicit legacy 301s in `next.config.ts` (`statusCode: 301`); generic trailing slash 308; `metadataBase` mandatory.
- **Metadata:** code-owned `lib/seo.ts`; `{keyword phrase} — HAY2010`; homepage `title.absolute`; unique 120–160-character descriptions; `lang="fr"`, `og:locale="fr_FR"`; light-only; Payload `seo` fields developer-only at launch.
- **Structured data:** `Organization` + `WebSite` (homepage) + `WebPage`; `Article` only for a live communiqué; no `LocalBusiness`/`Electrician`, `JobPosting`, `BreadcrumbList`, `Review`, `sameAs`, `logo`, `telephone`, `foundingDate` or `areaServed` at launch. `ElectricalContractor` is not a schema.org type.
- **Share card:** one static 1200×630 typographic JPEG on ink with the `HAY2010` wordmark, orange rule and service line; no badge until logo ownership is confirmed; no per-page card at launch; no dynamic `ImageResponse`.
- **Crawl:** `robots.ts` allows all except `/admin`, `/api`, `/preview`; AI crawlers allowed at launch; `sitemap.ts` with the eight launch URLs, no `priority`/`changeFrequency`, real `lastModified` only; Search Console/Bing by DNS TXT.
- **Legacy WordPress:** 301 for `/company`, `/services*`, `/projects`, `/project`, `/contact/`, old sitemaps and case variants; 410 for demo posts, date/category/author archives, portfolio/member CPT, feeds, WooCommerce, `/wp-content`, `/wp-includes`, `/sample-page`, `/blog` (until Actualités), root pagination and WP query strings; 404/403 at the Cloudflare edge for WP internals. No content migration.
- **Keywords:** `éclairage public Rabat` umbrella; four service clusters on `/metiers`; no solaire until `solaireLive`; no blog at launch; no city doorway pages; no `meta keywords`; one-page `/metiers` ceiling accepted.
- **Deliverable:** spec only; implementation lands with the page build and #16. No production code in #11.
