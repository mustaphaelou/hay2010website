/**
 * The site origin and the code-owned identity of the crawler surface — the
 * single source every metadata, JSON-LD, sitemap and robots builder reads.
 *
 * Decision: docs/seo/seo-metadata.md §2.1/§2.4/§4.1. The canonical origin is
 * the apex `https://hay2010.ma`, HTTPS and without a trailing slash. The host
 * redirects (`http`/`www` → apex) are Cloudflare edge rules, not app routes.
 *
 * `NEXT_PUBLIC_SERVER_URL` is a public build-time value baked into the image
 * (`Dockerfile`, CI). The documented fallback for every environment that does
 * not set it — local development and unconfigured previews — is the production
 * apex: a share card or canonical must never say `localhost`. Setting the
 * variable to `https://staging.hay2010.ma` on the staging build makes its
 * canonicals self-referencing (staging stays noindex; SEO §6.5). An invalid
 * value falls back to the apex rather than emitting a broken absolute URL.
 */
const FALLBACK_ORIGIN = "https://hay2010.ma"

/** Reduce an environment value to a bare HTTPS-ish origin, or the fallback. */
function normalizeOrigin(value: string | undefined): string {
  const candidate = value?.trim()
  if (!candidate) return FALLBACK_ORIGIN

  try {
    const url = new URL(candidate)
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return FALLBACK_ORIGIN
    }
    // `origin` drops any path, search or hash: the canonical value is a bare
    // origin with no trailing slash (§2.4).
    return url.origin
  } catch {
    return FALLBACK_ORIGIN
  }
}

/** Canonical origin, e.g. `https://hay2010.ma` (no trailing slash). */
export const SITE_ORIGIN = normalizeOrigin(process.env.NEXT_PUBLIC_SERVER_URL)

/** `metadataBase` value: the canonical origin as a `URL` (§2.4). */
export const SITE_URL = new URL(SITE_ORIGIN)

/** Code-owned site identity used by every crawler-facing surface. */
export const SITE = {
  name: "HAY2010",
  alternateName: "HAY 2010",
  legalName: "SOCIETE HAY 2010",
  url: SITE_ORIGIN,
  email: "contact@hay2010.ma",
  /** Open Graph locale `fr_FR`, not `fr_MA` (§4.3). */
  locale: "fr_FR",
  language: "fr",
  /** Approved positioning line (facts register §2.2; SEO §5.2 description). */
  description:
    "Depuis plus de 10 ans, HAY2010 accompagne les collectivités et les entreprises dans leurs projets d’éclairage public et d’électrification.",
  /** The one typographic 1200×630 card; no badge or photo until rights (§4.1). */
  ogImage: {
    url: `${SITE_ORIGIN}/og/hay2010-default.png`,
    width: 1200,
    height: 630,
    type: "image/png",
    alt: "HAY2010 — éclairage public et électrification à Rabat",
  },
} as const

/** Normalise a route to its canonical path: leading slash, no trailing slash. */
export function canonicalPath(path: string): string {
  if (!path || path === "/") return "/"
  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`
  return withLeadingSlash.replace(/\/+$/, "")
}

/**
 * Absolute canonical URL for a route: apex origin, no trailing slash, no query.
 * The homepage is the origin itself (never `https://hay2010.ma/`).
 */
export function absoluteUrl(path: string): string {
  const canonical = canonicalPath(path)
  return canonical === "/" ? SITE_ORIGIN : `${SITE_ORIGIN}${canonical}`
}
