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

/**
 * Render-side gate for the gated named-case-study family `/realisations/{slug}`.
 *
 * The family opens only at three approved named case studies (realisations
 * strategy §4); `CASE_STUDIES_LIVE` is code-owned and false at P1, and no
 * record exists in the P1 corpus. The route is already rewritten to the branded
 * 404 by `proxy.ts` (see `resolveRouteGate`); this guard covers a rendering that
 * bypasses the proxy, exactly like the rubrique/domain guards.
 *
 * Deliberately unconditional: opening the family is not a flag flip — it also
 * needs the per-record lookup and permission validation (#30), so this module
 * has nothing publishable to return until then. Returning `never` keeps the
 * page file honest: no caller can render a case study by accident.
 */
export async function requirePublishedCaseStudy(): Promise<never> {
  notFound()
}

/** Every published domain route, for the sitemap. */
export async function listPublishedDomainPaths(): Promise<string[]> {
  const domains = await getPublishedDomains()
  return domains.map((domain) => getDomainPath(domain.slug))
}
