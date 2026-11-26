/**
 * Placeholder navigation source for the P1 rubriques.
 *
 * Single source for the header row and the footer rubrique links, so the two
 * can never disagree. It is intentionally minimal: ticket #21 replaces it with
 * the full rubrique registry (tier + gate flags) that also drives the drawer,
 * the sitemap and `aria-current`. No gate logic lives here yet.
 *
 * Labels are French copy and use typographic apostrophes.
 */
export interface NavItem {
  /** Stable key for the rubrique, reused by the future registry. */
  readonly key: string
  /** Nav short label (CDC wording, see docs/spec/p1-website-build.md). */
  readonly label: string
  /** Canonical route, French at the root, no trailing slash. */
  readonly href: string
}

/** The five P1 rubriques, in navigation order. Accueil is always first. */
export const MAIN_NAVIGATION: readonly NavItem[] = [
  { key: "accueil", label: "Accueil", href: "/" },
  { key: "a-propos", label: "À propos", href: "/a-propos" },
  {
    key: "domaines-activite",
    label: "Domaines d’activité",
    href: "/domaines-activite",
  },
  { key: "realisations", label: "Réalisations", href: "/realisations" },
  { key: "contact", label: "Contact", href: "/contact" },
] as const
