/**
 * Path helpers shared by the request proxy and the route gate.
 *
 * `proxy.ts` runs before rendering (legacy maps, trailing-slash normalisation)
 * and `lib/site/route-gate.ts` resolves the publication gate for a pathname;
 * both must agree on the canonical no-slash form, so the normaliser is defined
 * here once instead of being copied into each call site.
 */

/** Reduce a pathname to the canonical no-trailing-slash form used by the maps. */
export function normalisePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.replace(/\/+$/, "")
  }
  return pathname
}
