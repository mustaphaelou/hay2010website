/**
 * Launch metadata defaults, code-owned — one row per P1 route.
 *
 * Source of truth: docs/seo/seo-metadata.md §3.2 (title pattern), §3.3 (launch
 * title and description table, adapted to the decided P1 routes: `/entreprise`
 * → `/a-propos`, `/metiers` → `/domaines-activite`). The phrase never carries
 * the brand suffix; the title pattern appends `— HAY2010` exactly once.
 *
 * Ownership (SEO §3.1): these defaults are developer-owned, never CMS-editable.
 * A page's content model may supply the description (the page document's
 * `description`), and #30 may add optional `seo.title`/`seo.description`
 * overrides on the page model; both are validated by `resolvePageSeo`, and an
 * empty or invalid override falls back to these defaults rather than shipping
 * an empty head.
 *
 * The legal-page values move here from `lib/legal/metadata.ts` (#28's temporary
 * home, absorbed by #32 per the content-seam contract). The `/contact` and
 * `/politique-de-confidentialite` descriptions are the staging-safe variants
 * (§3.3): the mailboxes are owner-approved but a mailbox send/receive test is a
 * public-launch gate, so no `contact@`/`donnees@` address is published in
 * metadata yet.
 */
export interface PageSeoDefault {
  /** Keyword-led page phrase, without the `— HAY2010` brand suffix. */
  readonly phrase: string
  /** Approved 120–160 character description. */
  readonly description: string
  /** schema.org WebPage subtype (§5.4). */
  readonly webPageType: WebPageType
}

/** The schema.org WebPage subtypes a P1 page may declare (SEO §5.4). */
export type WebPageType = "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage"

/** The P1 launch routes: title phrase, description and WebPage subtype. */
export const PAGE_SEO: Readonly<Record<string, PageSeoDefault>> = {
  "/": {
    phrase: "Éclairage public et électrification à Rabat",
    description:
      "Entreprise d’éclairage public et d’électrification HTA/MT, MT/BT, postes de transformation et CFO/CFA à Rabat. Plus de 10 ans d’expérience. Études et travaux.",
    webPageType: "WebPage",
  },
  "/a-propos": {
    phrase: "L’Entreprise, électricité et éclairage public",
    description:
      "HAY2010, société d’électricité et d’éclairage public à Rabat\u00a0: plus de 10 ans d’expérience au service des collectivités et des entreprises. Études et travaux.",
    webPageType: "AboutPage",
  },
  "/domaines-activite": {
    phrase: "Éclairage public, réseaux HTA/MT et CFO/CFA",
    description:
      "Les domaines d’activité de HAY2010 à Rabat\u00a0: éclairage public, installations électriques CFO/CFA et réseaux HTA/MT et MT/BT avec postes de transformation.",
    webPageType: "WebPage",
  },
  "/realisations": {
    phrase: "Réalisations et références",
    description:
      "Références de HAY2010 en éclairage public et électrification\u00a0: méthode de projet et références transmises sur demande. Plus de 10 ans d’expérience.",
    webPageType: "CollectionPage",
  },
  "/contact": {
    phrase: "Contact à Rabat",
    description:
      "Contactez HAY2010 à Rabat\u00a0: Local N° 21, Hay El Manzeh, Hay Er-Riad. Écrivez-nous pour vos projets d’éclairage public. Devis sur demande.",
    webPageType: "ContactPage",
  },
  "/carrieres": {
    phrase: "Carrières et offres d’emploi",
    description:
      "Les offres d’emploi de HAY2010, entreprise d’éclairage public et d’électrification à Rabat, et la façon de nous contacter.",
    webPageType: "WebPage",
  },
  "/mentions-legales": {
    phrase: "Mentions légales",
    description:
      "Mentions légales de SOCIETE HAY 2010 (SARL, RC 87305, ICE 001459327000056)\u00a0: éditeur, propriété intellectuelle, données personnelles et cookies.",
    webPageType: "WebPage",
  },
  "/politique-de-confidentialite": {
    phrase: "Politique de confidentialité",
    description:
      "Politique de confidentialité de SOCIETE HAY 2010\u00a0: données traitées, finalités, durées de conservation, droits et cookies. Comment exercer vos droits.",
    webPageType: "WebPage",
  },
}

/** The code-owned default for a route, or `undefined` for a content-only route. */
export function getPageSeoDefault(path: string): PageSeoDefault | undefined {
  return PAGE_SEO[path]
}
