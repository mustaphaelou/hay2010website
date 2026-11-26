/**
 * Pre-render gate resolution for proxy.ts — pure routing data, no
 * `next/navigation` import, so the proxy bundle stays minimal.
 */
import { getPublishedDomain, DOMAINES_ROUTE } from "@/lib/site/domaines"
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

/**
 * Resolve whether a pathname is a known route whose gate is open or closed.
 *
 * - exact rubrique route → its publish state;
 * - `/domaines-activite/{slug}` → the domain publish state, so unknown and
 *   closed slugs behave identically (404, never a hollow page);
 * - anything else → `unknown` (not a gate decision: the router's own 404 or a
 *   page guarded by `requirePublished*` handles it).
 */
export async function resolveRouteGate(pathname: string): Promise<RouteGate> {
  const path = normalizePath(pathname)

  const rubrique = RUBRIQUES.find((entry) => entry.href === path)
  if (rubrique) {
    const state = await getPublishState(rubrique.key)
    return state.published ? "open" : "closed"
  }

  if (isDomainChild(path)) {
    const domain = await getPublishedDomain(domainSlugFromPath(path))
    return domain ? "open" : "closed"
  }

  return "unknown"
}

