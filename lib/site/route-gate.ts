/**
 * Pre-render gate resolution for proxy.ts — pure routing data, no
 * `next/navigation` import, so the proxy bundle stays minimal.
 */
import { getContentProviderName } from "@/lib/content"
import {
  DOMAIN_KEYS,
  domainGateOpen,
} from "@/lib/payload/content-map"
import { getPublishedDomain, DOMAINES_ROUTE } from "@/lib/site/domaines"
import { caseStudiesLive } from "@/lib/site/realisations"
import { getPublishState, RUBRIQUES } from "@/lib/site/rubriques"

/** Result of pre-render gate resolution for one pathname. */
export type RouteGate = "open" | "closed" | "unknown"

/** Strip the trailing slash (Next normalises to the no-slash canonical form). */
function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.replace(/\/+$/, "")
  return pathname
}

function isDomainChild(pathname: string): boolean {
  return (
    pathname.startsWith(`${DOMAINES_ROUTE}/`) &&
    !pathname.slice(DOMAINES_ROUTE.length + 1).includes("/")
  )
}

function domainSlugFromPath(pathname: string): string {
  return pathname.slice(DOMAINES_ROUTE.length + 1)
}

/** The `/realisations` rubrique route, read from the registry (one source). */
const REALISATIONS_ROUTE =
  RUBRIQUES.find((entry) => entry.key === "realisations")?.href ?? "/realisations"

/** One-level child of a route, e.g. `/realisations/{slug}` but not a deeper path. */
function isChildOf(pathname: string, route: string): boolean {
  return (
    pathname.startsWith(`${route}/`) &&
    !pathname.slice(route.length + 1).includes("/")
  )
}

/**
 * Resolve whether a pathname is a known route whose gate is open or closed.
 *
 * - exact rubrique route → its publish state;
 * - `/domaines-activite/{slug}` → the domain publish state, so unknown and
 *   closed slugs behave identically (404, never a hollow page);
 * - `/realisations/{slug}` → the code-owned named-case-study gate: closed at
 *   every tier until three approved named case studies exist, so the route
 *   family gets the server-rendered branded 404 (content-seam §5);
 * - anything else → `unknown` (not a gate decision: the router's own 404 or a
 *   page guarded by `requirePublished*` handles it).
 */
export async function resolveRouteGate(pathname: string): Promise<RouteGate> {
  const path = normalizePath(pathname)

  /**
   * CMS mode (#29): the proxy stays database-free, but the **code-owned** gates
   * are resolvable without a query — they are literals in
   * `lib/payload/content-map.ts`. Resolving them here (instead of returning
   * `unknown`) matters for #30's parity contract: a code-gated route then gets
   * the same server-rendered branded 404 document as the fixture build, rather
   * than a runtime `notFound()` shell that only a JavaScript client can hydrate.
   *
   * Only the CMS publish state is deferred to layer 2
   * (`requirePublishedRubrique()` in the page files): a P1 page the owner
   * unpublishes answers 404 at the render boundary, as documented in
   * docs/build/cms.md ("Gate resolution in CMS mode").
   */
  if (getContentProviderName() === "cms") {
    const cmsRubrique = RUBRIQUES.find((entry) => entry.href === path)
    if (cmsRubrique) {
      // P2/P3 tiers are code-owned: a CMS record could never open them.
      return cmsRubrique.tier === "P1" ? "unknown" : "closed"
    }

    if (isDomainChild(path)) {
      const slug = domainSlugFromPath(path)
      // Unknown or code-gated domain slugs are closed at the code level
      // (the five slugs are a code-owned enum, content-map.ts).
      const known = DOMAIN_KEYS.some((domain) => domain.slug === slug)
      return known && domainGateOpen(slug) ? "unknown" : "closed"
    }

    if (isChildOf(path, REALISATIONS_ROUTE)) {
      return caseStudiesLive() ? "unknown" : "closed"
    }

    return "unknown"
  }

  const rubrique = RUBRIQUES.find((entry) => entry.href === path)
  if (rubrique) {
    const state = await getPublishState(rubrique.key)
    return state.published ? "open" : "closed"
  }

  if (isDomainChild(path)) {
    const domain = await getPublishedDomain(domainSlugFromPath(path))
    return domain ? "open" : "closed"
  }

  if (isChildOf(path, REALISATIONS_ROUTE)) {
    // When the family opens, per-record publication is a page-level decision:
    // return `unknown` and let the route guard resolve the record.
    return caseStudiesLive() ? "unknown" : "closed"
  }

  return "unknown"
}

