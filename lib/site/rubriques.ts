/**
 * The rubrique registry's seam half — published derivations over the one
 * code-owned registry (`lib/site/rubrique-registry.ts`).
 *
 * The registry itself is pure data (keys, CDC titles, nav/admin labels, routes,
 * tiers) so the Payload content map can derive from it without importing this
 * module or the content seam. This file adds the published derivations every
 * surface uses: they read the gate through the content source
 * (`getPublishState` / `listPublishedRubriques`), so a fixture scenario or the
 * CMS can close a page without touching the registry.
 *
 * Rendering code must never read `RUBRIQUES` directly to build a menu: use the
 * published derivations below (or `requirePublishedRubrique` from
 * `lib/site/gates.ts`). They are the only functions that apply the gate.
 */
import { getContentSource } from "@/lib/content"
import type { PublishState, RubriqueKey } from "@/lib/content/types"
import {
  RUBRIQUE_REGISTRY,
  type RubriqueEntry,
} from "@/lib/site/rubrique-registry"

export type {
  RubriqueEntry,
  RubriqueKind,
} from "@/lib/site/rubrique-registry"

/**
 * The registry, re-exported under its historical name. It is a reference to the
 * single definition in `lib/site/rubrique-registry.ts`, never a copy.
 */
export const RUBRIQUES = RUBRIQUE_REGISTRY

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
