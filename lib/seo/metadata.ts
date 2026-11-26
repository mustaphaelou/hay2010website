/**
 * Page metadata: one canonical URL, one resolved title, one unique description,
 * one complete Open Graph/Twitter block — generated from the page model with
 * the code-owned launch defaults as the fallback.
 *
 * Rules implemented here (docs/seo/seo-metadata.md §2, §3, §4):
 * - title pattern `{phrase} — HAY2010`, em dash with spaces, exactly one brand
 *   suffix, homepage `title.absolute` (§3.2);
 * - descriptions 120–160 characters target, hard bounds 100–170 (§3.4) — the
 *   helper throws rather than shipping an empty or out-of-band description;
 * - one absolute, apex, HTTPS, query-free, trailing-slash-free canonical per
 *   page (§2.3/§2.5); the homepage canonical is the origin itself;
 * - the complete `openGraph`/`twitter` objects on every page: Next's metadata
 *   merge is shallow, so a partial object would drop inherited images (§3.7);
 * - `robots` index/follow + Googlebot image/snippet hints on public pages, and
 *   `noindex` only for the documents that are never indexable (§6.3).
 *
 * #30 override hook: a page may pass `phrase`/`description` read from the page
 * model (the CMS `seo` group later maps to the same two values). Overrides are
 * trimmed and validated; they never include the brand suffix and never carry a
 * free-form URL. Anything absent falls back to `PAGE_SEO`, then to a generated
 * description that still satisfies the length bounds — never to an empty tag.
 */
import type { Metadata } from "next"

import { PAGE_SEO, type WebPageType } from "./pages"
import { absoluteUrl, canonicalPath, SITE } from "./site"

export type { WebPageType }

/** A resolved page SEO record, shared by the metadata and JSON-LD builders. */
export interface PageSeo {
  /** Canonical path, leading slash, no trailing slash (`/` for the homepage). */
  readonly path: string
  /** The keyword-led phrase without the brand suffix (model or default). */
  readonly phrase: string
  /** Resolved `<title>`: `{phrase} — HAY2010`, or the homepage absolute title. */
  readonly title: string
  /** Resolved meta description (120–160 characters for the P1 routes). */
  readonly description: string
  /** Absolute canonical URL, apex, no trailing slash. */
  readonly canonical: string
  /** schema.org WebPage subtype (§5.4). */
  readonly webPageType: WebPageType
}

export interface PageSeoInput {
  /** Canonical route, e.g. `/a-propos`; never a full URL. */
  readonly path: string
  /**
   * Page-model title (the page h1 wording or a CMS `seo.title` override). It is
   * a keyword-led phrase *without* the brand suffix. Omit to use the code-owned
   * launch default for the route.
   */
  readonly phrase?: string
  /**
   * Page-model description (120–160 characters, decided copy) or a CMS
   * `seo.description` override. Omit to use the code-owned launch default.
   */
  readonly description?: string
  /** WebPage subtype; defaults to the launch default, then `WebPage`. */
  readonly webPageType?: WebPageType
}

/** Hard title bound (§3.2: hard maximum 65; target 45–60 is a writing rule). */
const TITLE_MAX = 65
/** Description hard bounds (§3.4: hard minimum 100, hard maximum 170). */
const DESCRIPTION_MIN = 100
const DESCRIPTION_MAX = 170

/** A page cannot ship without its title and description (§3.5). */
function fail(message: string): never {
  throw new Error(`[seo] ${message}`)
}

/** Trim a model/CMS value; an all-whitespace value counts as absent. */
function optional(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

/**
 * Generated fallback description for a content route without decided metadata
 * (for example a P2/P3 domain document opened by a gate simulation). It names
 * the page and the approved positioning only: no gated claim, no placeholder,
 * and it stays inside the hard length bounds.
 */
function fallbackDescription(phrase: string): string {
  return `HAY2010, entreprise d’éclairage public et d’électrification à Rabat. ${phrase} : études, travaux et mise en service.`
}

/** Validate and resolve the metadata of one page. */
export function resolvePageSeo(input: PageSeoInput): PageSeo {
  const path = canonicalPath(input.path)
  const defaults = PAGE_SEO[path]

  const phrase = optional(input.phrase) ?? defaults?.phrase
  if (!phrase) {
    fail(`no title phrase for "${path}": pass one or add a PAGE_SEO default`)
  }
  if (phrase.includes("— HAY2010")) {
    fail(`the title phrase for "${path}" must not include the brand suffix`)
  }

  // The homepage uses `title.absolute`, brand first, so it is never
  // double-suffixed by the root template (§3.2).
  const title =
    path === "/" ? `HAY2010 — ${phrase}` : `${phrase} — HAY2010`

  if (title.length > TITLE_MAX) {
    fail(`the title for "${path}" is ${title.length} characters (max ${TITLE_MAX})`)
  }

  const description =
    optional(input.description) ??
    defaults?.description ??
    fallbackDescription(phrase)

  if (
    description.length < DESCRIPTION_MIN ||
    description.length > DESCRIPTION_MAX
  ) {
    fail(
      `the description for "${path}" is ${description.length} characters ` +
        `(bounds ${DESCRIPTION_MIN}–${DESCRIPTION_MAX})`
    )
  }
  // No HTML in a description (§3.4).
  if (/<[^>]+>/.test(description)) {
    fail(`the description for "${path}" must be plain text`)
  }

  return {
    path,
    phrase,
    title,
    description,
    canonical: absoluteUrl(path),
    webPageType: input.webPageType ?? defaults?.webPageType ?? "WebPage",
  }
}

/** Full page metadata, safe for Next's shallow metadata merge. */
export function pageMetadata(seo: PageSeo): Metadata {
  const image = {
    url: SITE.ogImage.url,
    width: SITE.ogImage.width,
    height: SITE.ogImage.height,
    type: SITE.ogImage.type,
    alt: SITE.ogImage.alt,
  }

  return {
    // The root layout declares `title.template = "%s — HAY2010"`; pages supply
    // the phrase only, and the homepage bypasses the template with `absolute`
    // (brand first) so the suffix appears exactly once (§3.2).
    title: seo.path === "/" ? { absolute: seo.title } : seo.phrase,
    description: seo.description,
    alternates: { canonical: seo.canonical },
    openGraph: {
      type: "website",
      title: seo.title,
      description: seo.description,
      url: seo.canonical,
      siteName: SITE.name,
      locale: SITE.locale,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  }
}
