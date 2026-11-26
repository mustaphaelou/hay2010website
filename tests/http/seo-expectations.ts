/**
 * SEO expectations — the independent source of truth for ticket #32's crawler
 * surface.
 *
 * These values are transcribed from the decided documents, not imported from
 * the implementation: docs/seo/seo-metadata.md §2 (canonical origin/URL policy),
 * §3.2–§3.3 (title pattern and the launch title/description table, adapted to
 * the decided P1 routes `/a-propos` and `/domaines-activite`), §4 (Open Graph /
 * Twitter), §5 (structured data types) and §6 (robots, sitemap, 404/410).
 *
 * A route is in this map only when it is a decided P1 page *and* its metadata
 * is approved copy. The P2/P3 simulation scenarios open routes that have no
 * decided metadata yet (for example the gated domain documents opened by the
 * `p2` corpus); those routes are covered by the generic rules (unique title,
 * one canonical, no gated claim) but not by the P1 literals.
 */

/** Canonical production origin (SEO §2.1). */
export const CANONICAL_ORIGIN = "https://hay2010.ma"

/** Open Graph locale: fr_FR, never fr_MA (SEO §4.3). */
export const OG_LOCALE = "fr_FR"

/** The only structured-data types allowed on a P1 page (SEO §5.6). */
export type WebPageType = "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage"

export interface PageSeoExpectation {
  /** The resolved `<title>`, brand suffix included exactly once. */
  readonly title: string
  /** The resolved meta description, 120–160 characters. */
  readonly description: string
  /** The schema.org WebPage subtype the page must declare (§5.4). */
  readonly webPageType: WebPageType
}

/**
 * Approved metadata for the launch routes, from SEO §3.3 adapted to the P1
 * routes (`/entreprise` → `/a-propos`, `/metiers` → `/domaines-activite`).
 *
 * `/carrieres` is intentionally absent: its description depends on the F-113
 * gate state and is supplied by `scenario.careers.description` instead.
 */
export const P1_PAGE_SEO: Readonly<Record<string, PageSeoExpectation>> = {
  "/": {
    title: "HAY2010 — Éclairage public et électrification à Rabat",
    description:
      "Entreprise d’éclairage public et d’électrification HTA/MT, MT/BT, postes de transformation et CFO/CFA à Rabat. Plus de 10 ans d’expérience. Études et travaux.",
    webPageType: "WebPage",
  },
  "/a-propos": {
    title: "L’Entreprise, électricité et éclairage public — HAY2010",
    description:
      "HAY2010, société d’électricité et d’éclairage public à Rabat : plus de 10 ans d’expérience au service des collectivités et des entreprises. Études et travaux.",
    webPageType: "AboutPage",
  },
  "/domaines-activite": {
    title: "Éclairage public, réseaux HTA/MT et CFO/CFA — HAY2010",
    description:
      "Les domaines d’activité de HAY2010 à Rabat : éclairage public, installations électriques CFO/CFA et réseaux HTA/MT et MT/BT avec postes de transformation.",
    webPageType: "WebPage",
  },
  "/domaines-activite/eclairage-public": {
    title: "Éclairage public — HAY2010",
    description:
      "HAY2010 réalise les travaux d’éclairage public à Rabat : études, installation et mise en service des ouvrages, pour les collectivités et les entreprises.",
    webPageType: "WebPage",
  },
  "/domaines-activite/installations-electriques": {
    title: "Installations électriques — HAY2010",
    description:
      "HAY2010 réalise les installations électriques CFO/CFA : tableaux, distribution, protection, câblage et mise en service, pour collectivités et entreprises.",
    webPageType: "WebPage",
  },
  "/domaines-activite/infrastructures-reseaux-electriques": {
    title: "Infrastructures et réseaux électriques — HAY2010",
    description:
      "HAY2010 réalise les infrastructures et réseaux électriques HTA/MT et MT/BT, y compris les postes de transformation, pour les collectivités et les entreprises.",
    webPageType: "WebPage",
  },
  "/realisations": {
    title: "Réalisations et références — HAY2010",
    description:
      "Références de HAY2010 en éclairage public et électrification : méthode de projet et références transmises sur demande. Plus de 10 ans d’expérience.",
    webPageType: "CollectionPage",
  },
  "/contact": {
    title: "Contact à Rabat — HAY2010",
    description:
      "Contactez HAY2010 à Rabat : Local N° 21, Hay El Manzeh, Hay Er-Riad. Écrivez-nous pour vos projets d’éclairage public. Devis sur demande.",
    webPageType: "ContactPage",
  },
  "/mentions-legales": {
    title: "Mentions légales — HAY2010",
    description:
      "Mentions légales de SOCIETE HAY 2010 (SARL, RC 87305, ICE 001459327000056) : éditeur, propriété intellectuelle, données personnelles et cookies.",
    webPageType: "WebPage",
  },
  "/politique-de-confidentialite": {
    title: "Politique de confidentialité — HAY2010",
    description:
      "Politique de confidentialité de SOCIETE HAY 2010 : données traitées, finalités, durées de conservation, droits et cookies. Comment exercer vos droits.",
    webPageType: "WebPage",
  },
}

/** Approved Carrières metadata title (SEO §3.3, one brand suffix). */
export const CAREERS_TITLE = "Carrières et offres d’emploi — HAY2010"

/** 404 document metadata: French title, no description, no canonical (§3.3/§6.3). */
export const NOT_FOUND_TITLE = "Page introuvable — HAY2010"

/**
 * Gated claims/values that may never appear in the metadata of a published P1
 * page (facts register §2–§3, SEO §3.4/§8). Each entry is a regular expression
 * matched case-insensitively against the title, description, Open Graph,
 * Twitter and JSON-LD text of the P1 route set.
 */
export const GATED_METADATA_PATTERNS: readonly RegExp[] = [
  /agrément/i,
  /ONEE/,
  /certifi/i,
  /entreprise agréée/i,
  /depuis (?:2004|2011)/i,
  /créée? en 2004/i,
  /plus de 20 ans/i,
  /\bleader\b/i,
  /n°\s*1\b/i,
  /partenaire officiel/i,
  /RC\s*517/i,
  /6\s*000\s*000/,
  /4\s*700\s*000/,
  /500\s*000/,
  /IF\s*6580342/,
  /HTA-BT0/i,
  /solaire/i,
  /photovoltaïque/i,
  /\+212/,
  /05\s*37\s*281\s*111/,
  /téléphone/i,
  /ste\.hay2010@gmail\.com/i,
  /recrutement@/i,
  /CNDP\s*n°/i,
]

/** Accepted sitemap pathnames for one scenario (helper: route → expected path). */
export function sitemapPathOf(route: string): string {
  return route === "/" ? "" : route
}

/** PNG ceil(width/height) can be read from IHDR: bytes 16–23. */
export function pngDimensions(buffer: Uint8Array): { width: number; height: number } {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
  return { width: view.getUint32(16), height: view.getUint32(20) }
}
