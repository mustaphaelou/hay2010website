/**
 * Structured data — one JSON-LD `@graph` per page, exactly the decided entity
 * set (docs/seo/seo-metadata.md §5):
 *
 * - `Organization` on every page, built only from facts-register §2 fields
 *   (name, legal name, URL, public mailbox, registered seat, RC/ICE identifiers,
 *   the four approved services). Deliberately absent: `logo` (ownership open),
 *   `telephone` (gated), `sameAs` (no confirmed account), `foundingDate`,
 *   `areaServed`, reviews, prices and every other unsupported property (§5.7).
 * - `WebSite` on the homepage only (§5.3), no `SearchAction` (no site search).
 * - `WebPage` on every page, with the accurate subtype (§5.4): `AboutPage` for
 *   `/a-propos`, `ContactPage` for `/contact`, `CollectionPage` for
 *   `/realisations`, `WebPage` elsewhere.
 *
 * Not at launch: `LocalBusiness`/`Electrician`, `JobPosting`, `BreadcrumbList`,
 * `Review`/`AggregateRating`, `Service`, `FAQPage`, `Person`, `sameAs`, `logo`,
 * `telephone`. The HTTP suite asserts the whitelist and the gated-property
 * denylist; do not add a node without a decided document.
 */
import { SITE } from "./site"
import type { PageSeo } from "./metadata"

/** Stable `@id` of the single Organization entity (§5.2). */
export const ORGANIZATION_ID = `${SITE.url}/#organization`

/** Stable `@id` of the single WebSite entity (§5.3). */
export const WEBSITE_ID = `${SITE.url}/#website`

/** One JSON-LD node; widely typed because the nodes differ per @type. */
export type JsonLdNode = Record<string, unknown>

export interface JsonLdGraph {
  readonly "@context": "https://schema.org"
  readonly "@graph": readonly JsonLdNode[]
}

/** The Organization node: facts-register-cleared identity only (§5.2). */
function organizationNode(): JsonLdNode {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE.name,
    alternateName: [SITE.alternateName],
    legalName: SITE.legalName,
    url: SITE.url,
    email: SITE.email,
    description: SITE.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Local N° 21, Hay El Manzeh, Hay Er-Riad",
      addressLocality: "Rabat",
      addressCountry: "MA",
    },
    identifier: [
      { "@type": "PropertyValue", name: "RC", value: "87305" },
      { "@type": "PropertyValue", name: "ICE", value: "001459327000056" },
    ],
    knowsAbout: [
      "Éclairage public",
      "Réseaux HTA/MT & MT/BT",
      "Postes de transformation",
      "CFO/CFA",
    ],
  }
}

/** The WebSite node: homepage only, no site search (§5.3). */
function websiteNode(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE.url,
    name: SITE.name,
    alternateName: [SITE.alternateName],
    inLanguage: SITE.language,
    publisher: { "@id": ORGANIZATION_ID },
  }
}

/** The WebPage node of the page being served (§5.4). */
function webPageNode(seo: PageSeo): JsonLdNode {
  return {
    "@type": seo.webPageType,
    "@id": `${seo.canonical}#webpage`,
    url: seo.canonical,
    name: seo.title,
    // A URL value, not a cross-page @id: WebSite exists on the homepage only.
    isPartOf: SITE.url,
    about: { "@id": ORGANIZATION_ID },
    inLanguage: SITE.language,
  }
}

/**
 * The single `@graph` of one page: Organization, then WebSite on the homepage,
 * then WebPage. One native script per page avoids duplicate entity nodes.
 */
export function buildPageGraph(seo: PageSeo): JsonLdGraph {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(),
      ...(seo.path === "/" ? [websiteNode()] : []),
      webPageNode(seo),
    ],
  }
}
