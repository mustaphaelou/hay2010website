/**
 * The rubrique registry — the single source of navigation truth (spec:
 * "Rubriques, gates and navigation"). It is code-owned: keys, CDC titles, nav
 * short labels, admin labels, routes and tiers never come from the CMS
 * (content model §3).
 *
 * This module is deliberately **pure data**: no Next.js, no Payload, no
 * content-seam import, so both consumers can derive from it without pulling
 * either graph:
 * - `lib/site/rubriques.ts` adds the seam-backed published derivations the
 *   rendering code uses;
 * - `lib/payload/content-map.ts` derives the admin labels and tier gates that
 *   `payload.config.ts` needs, without importing the content seam.
 *
 * `tests/architecture.test.ts` asserts this is the one definition: neither
 * consumer may reintroduce a literal mirror of the keys, labels or tiers.
 *
 * What is *not* code-owned here: the open/closed state of a gate. That comes
 * from the content source (`getPublishState` / `listPublishedRubriques`), so a
 * fixture scenario or the CMS can close a page without touching this file.
 */
import type { RubriqueKey, Tier } from "../content/types"

/** Kind of registry entry: a CDC rubrique or a P1 utility page. */
export type RubriqueKind = "rubrique" | "utility"

export interface RubriqueEntry {
  /** Stable code-owned identifier, also the content document key. */
  readonly key: RubriqueKey
  /** Full title, CDC wording (used as the default h1/metadata source). */
  readonly title: string
  /** Short label for the desktop row and the drawer (CDC wording). */
  readonly navLabel: string
  /**
   * French label shown in the Payload admin for this code-owned key. It is the
   * registry's admin-side name, not CMS content: the owner can never edit it.
   */
  readonly adminLabel: string
  /** Canonical route, French at the root, no trailing slash. */
  readonly href: string
  /** Delivery tier — code-owned; P2/P3 entries stay closed at launch. */
  readonly tier: Tier
  /** Rubriques are navigation entries; utilities are footer/drawer links only. */
  readonly kind: RubriqueKind
}

/**
 * The eight CDC rubriques in navigation order, then the utility pages.
 *
 * Navigation order is CDC order: Accueil first, Contact last, P2 (Moyens,
 * Références) and P3 (Actualités) inserted before Contact as their tier opens.
 * Utilities are never in the desktop row: Carrières is footer-only and the
 * legal pages sit in the footer/drawer.
 */
export const RUBRIQUE_REGISTRY: readonly RubriqueEntry[] = [
  {
    key: "accueil",
    title: "Accueil",
    navLabel: "Accueil",
    adminLabel: "Accueil",
    href: "/",
    tier: "P1",
    kind: "rubrique",
  },
  {
    key: "a-propos",
    title: "À propos",
    navLabel: "À propos",
    adminLabel: "À propos",
    href: "/a-propos",
    tier: "P1",
    kind: "rubrique",
  },
  {
    key: "domaines-activite",
    title: "Nos domaines d’activité",
    navLabel: "Domaines d’activité",
    adminLabel: "Domaines d’activité",
    href: "/domaines-activite",
    tier: "P1",
    kind: "rubrique",
  },
  {
    key: "realisations",
    title: "Nos réalisations",
    navLabel: "Réalisations",
    adminLabel: "Réalisations",
    href: "/realisations",
    tier: "P1",
    kind: "rubrique",
  },
  {
    key: "moyens-et-competences",
    title: "Nos moyens et compétences",
    navLabel: "Moyens",
    adminLabel: "Moyens et compétences",
    href: "/moyens-et-competences",
    tier: "P2",
    kind: "rubrique",
  },
  {
    key: "references-et-partenaires",
    title: "Références et partenaires",
    navLabel: "Références",
    adminLabel: "Références et partenaires",
    href: "/references-et-partenaires",
    tier: "P2",
    kind: "rubrique",
  },
  {
    key: "actualites",
    title: "Actualités",
    navLabel: "Actualités",
    adminLabel: "Actualités",
    href: "/actualites",
    tier: "P3",
    kind: "rubrique",
  },
  {
    key: "contact",
    title: "Contact",
    navLabel: "Contact",
    adminLabel: "Contact",
    href: "/contact",
    tier: "P1",
    kind: "rubrique",
  },
  {
    key: "carrieres",
    title: "Carrières",
    navLabel: "Carrières",
    adminLabel: "Carrières",
    href: "/carrieres",
    tier: "P1",
    kind: "utility",
  },
  {
    key: "mentions-legales",
    title: "Mentions légales",
    navLabel: "Mentions légales",
    adminLabel: "Mentions légales",
    href: "/mentions-legales",
    tier: "P1",
    kind: "utility",
  },
  {
    key: "politique-de-confidentialite",
    title: "Politique de confidentialité",
    navLabel: "Politique de confidentialité",
    adminLabel: "Politique de confidentialité",
    href: "/politique-de-confidentialite",
    tier: "P1",
    kind: "utility",
  },
] as const
