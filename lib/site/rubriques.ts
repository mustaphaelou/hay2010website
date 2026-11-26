/**
 * The rubrique registry — the single source of navigation truth (spec:
 * "Rubriques, gates and navigation"). It is code-owned: keys, CDC titles, nav
 * short labels, routes, tiers and the navigation/utility split never come from
 * the CMS (content model §3).
 *
 * What is *not* code-owned here: the open/closed state of a gate. That comes
 * from the content source (`getPublishState` / `listPublishedRubriques`), so a
 * fixture scenario or the CMS can close a page without touching this file.
 *
 * Rendering code must never read `RUBRIQUES` directly to build a menu: use the
 * published derivations below (or `requirePublishedRubrique` from
 * `lib/site/gates.ts`). They are the only functions that apply the gate.
 */
import { getContentSource } from "@/lib/content"
import type { PublishState, RubriqueKey, Tier } from "@/lib/content/types"

/** Kind of registry entry: a CDC rubrique or a P1 utility page. */
export type RubriqueKind = "rubrique" | "utility"

export interface RubriqueEntry {
  /** Stable code-owned identifier, also the content document key. */
  readonly key: RubriqueKey
  /** Full title, CDC wording (used as the default h1/metadata source). */
  readonly title: string
  /** Short label for the desktop row and the drawer (CDC wording). */
  readonly navLabel: string
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
export const RUBRIQUES: readonly RubriqueEntry[] = [
  {
    key: "accueil",
    title: "Accueil",
    navLabel: "Accueil",
    href: "/",
    tier: "P1",
    kind: "rubrique",
  },
  {
    key: "a-propos",
    title: "À propos",
    navLabel: "À propos",
    href: "/a-propos",
    tier: "P1",
    kind: "rubrique",
  },
  {
    key: "domaines-activite",
    title: "Nos domaines d’activité",
    navLabel: "Domaines d’activité",
    href: "/domaines-activite",
    tier: "P1",
    kind: "rubrique",
  },
  {
    key: "realisations",
    title: "Nos réalisations",
    navLabel: "Réalisations",
    href: "/realisations",
    tier: "P1",
    kind: "rubrique",
  },
  {
    key: "moyens-et-competences",
    title: "Nos moyens et compétences",
    navLabel: "Moyens",
    href: "/moyens-et-competences",
    tier: "P2",
    kind: "rubrique",
  },
  {
    key: "references-et-partenaires",
    title: "Références et partenaires",
    navLabel: "Références",
    href: "/references-et-partenaires",
    tier: "P2",
    kind: "rubrique",
  },
  {
    key: "actualites",
    title: "Actualités",
    navLabel: "Actualités",
    href: "/actualites",
    tier: "P3",
    kind: "rubrique",
  },
  {
    key: "contact",
    title: "Contact",
    navLabel: "Contact",
    href: "/contact",
    tier: "P1",
    kind: "rubrique",
  },
  {
    key: "carrieres",
    title: "Carrières",
    navLabel: "Carrières",
    href: "/carrieres",
    tier: "P1",
    kind: "utility",
  },
  {
    key: "mentions-legales",
    title: "Mentions légales",
    navLabel: "Mentions légales",
    href: "/mentions-legales",
    tier: "P1",
    kind: "utility",
  },
  {
    key: "politique-de-confidentialite",
    title: "Politique de confidentialité",
    navLabel: "Politique de confidentialité",
    href: "/politique-de-confidentialite",
    tier: "P1",
    kind: "utility",
  },
] as const

/** Flat link shape handed to the client navigation and the footer. */
export interface NavigationItem {
  readonly key: RubriqueKey
  readonly label: string
  readonly href: string
}

/** Registry lookup by key; throws on a programming error (unknown key). */
export function getRubrique(key: RubriqueKey): RubriqueEntry {
  const rubrique = RUBRIQUES.find((entry) => entry.key === key)
  if (!rubrique) throw new Error(`Unknown rubrique key "${key}".`)
  return rubrique
}

/** Publish gate of a rubrique, read through the content seam. */
export async function getPublishState(key: RubriqueKey): Promise<PublishState> {
  const source = await getContentSource()
  return source.getPublishState(key)
}

/**
 * Rubriques whose gate is open, in registry (CDC) order.
 *
 * This is the published set every surface derives from: desktop row, drawer,
 * footer, 404 links, sitemap and metadata.
 */
export async function getPublishedRubriques(): Promise<RubriqueEntry[]> {
  const source = await getContentSource()
  const publishedKeys = new Set(await source.listPublishedRubriques())
  return RUBRIQUES.filter((rubrique) => publishedKeys.has(rubrique.key))
}

/** Published rubriques that belong in the desktop row / drawer navigation. */
export async function getPublishedNavigation(): Promise<NavigationItem[]> {
  return (await getPublishedRubriques())
    .filter((rubrique) => rubrique.kind === "rubrique")
    .map((rubrique) => ({ key: rubrique.key, label: rubrique.navLabel, href: rubrique.href }))
}

/** Published utility pages (footer and drawer bottom links). */
export async function getPublishedUtilities(): Promise<NavigationItem[]> {
  return (await getPublishedRubriques())
    .filter((rubrique) => rubrique.kind === "utility")
    .map((rubrique) => ({ key: rubrique.key, label: rubrique.navLabel, href: rubrique.href }))
}
