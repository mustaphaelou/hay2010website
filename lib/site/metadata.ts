/**
 * Page metadata helper for the P1 page tickets (#22–#28).
 *
 * Ticket #32 owns the complete SEO system (metadataBase, the title template,
 * Open Graph, canonical policy, JSON-LD). Until then this helper keeps each
 * page's metadata honest and unique: a title with the single `— HAY2010`
 * suffix, a 120–160 character description supplied by the page content, and
 * an absolute canonical apex URL without a trailing slash
 * (docs/seo/seo-metadata.md §2–§3).
 */
import type { Metadata } from "next"

import { SITE_URL } from "@/lib/site/site"

/** Canonical path: leading slash, no trailing slash (the homepage is "/"). */
function canonicalPath(path: string): string {
  if (path === "/") return SITE_URL
  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`
  return `${SITE_URL}${withLeadingSlash.replace(/\/+$/, "")}`
}

export interface PageMetadataInput {
  /** Page phrase, without the brand suffix (content-owned or CDC wording). */
  readonly title: string
  /** 120–160 character description, when the page content supplies one. */
  readonly description?: string
  /** Canonical route, e.g. `/domaines-activite`. */
  readonly path: string
}

/** Metadata for one page: title, description and canonical URL. */
export function pageMetadata({ title, description, path }: PageMetadataInput): Metadata {
  return {
    title: `${title} — HAY2010`,
    description:
      description ??
      `${title}. HAY2010, entreprise d’éclairage public et d’électrification à Rabat.`,
    alternates: { canonical: canonicalPath(path) },
  }
}
