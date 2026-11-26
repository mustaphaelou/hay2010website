/**
 * Gate enforcement — the only place routing decides that a page is closed.
 *
 * Two layers, on purpose (see docs/build/content-seam.md §"Gate semantics"):
 *
 * 1. `proxy.ts` runs `resolveRouteGate()` before rendering and rewrites a
 *    closed route to the branded 404 with a 404 status. This is the layer a
 *    visitor observes: a real, server-rendered 404 page, not a redirect and
 *    not an empty shell.
 * 2. `requirePublishedRubrique()` / `requirePublishedDomain()` are called as
 *    the first line of their page files. If a closed route ever reaches
 *    rendering (proxy bypassed, static rendering, a future transport), the
 *    page interrupts with `notFound()` instead of rendering hollow content.
 *
 * Later page tickets MUST call `requirePublishedRubrique()` (or
 * `requirePublishedDomain()`) before rendering anything — that is the render
 * half of the contract. When a ticket adds a new gated dynamic route family,
 * it also extends `resolveRouteGate` so the 404 page stays server-rendered.
 */
import { notFound } from "next/navigation"

import { getPublishState, getRubrique, type RubriqueEntry } from "@/lib/site/rubriques"
import {
  getDomainPath,
  getPublishedDomain,
  getPublishedDomains,
} from "@/lib/site/domaines"
import type { DomainDocument } from "@/lib/content/types"

/**
 * Render-side gate for a rubrique page. Call it first in every page file:
 *
 * ```tsx
 * export default async function Page() {
 *   await requirePublishedRubrique("a-propos")
 *   return <AProposPage /> // content landed by #25
 * }
 * ```
 */
export async function requirePublishedRubrique(key: RubriqueEntry["key"]): Promise<RubriqueEntry> {
  const state = await getPublishState(key)
  if (!state.published) notFound()
  return getRubrique(key)
}

/** Render-side gate (and document lookup) for a domain page. */
export async function requirePublishedDomain(slug: string): Promise<DomainDocument> {
  const domain = await getPublishedDomain(slug)
  if (!domain) notFound()
  return domain
}

/** Every published domain route, for the sitemap. */
export async function listPublishedDomainPaths(): Promise<string[]> {
  const domains = await getPublishedDomains()
  return domains.map((domain) => getDomainPath(domain.slug))
}
