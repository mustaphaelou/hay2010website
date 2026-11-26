import { NextResponse } from "next/server"

/**
 * Edge-free request proxy (Next.js 16 renamed `middleware` to `proxy`; this is
 * the project-root `proxy.ts` convention — see the Next docs "Proxy").
 *
 * Current responsibility, deliberately minimal: make every response from a
 * staging deployment non-indexable. `SITE_ENV=staging` is the single switch
 * (docs/ops/runbook.md "Environment"); anything else, including unset, behaves
 * as production and adds no header. The header is defence in depth on top of
 * Cloudflare Access on the staging host (docs/hosting/deployment-decision.md §7).
 *
 * EXTENSION POINT — ticket #32 owns the crawler surface and legacy URL map:
 * legacy WordPress 301/410 redirects and trailing-slash normalisation belong in
 * this file, above the header logic, so all of them run before routes render.
 * Do not add `app/robots.ts`/`app/sitemap.ts` here; #32 creates them.
 */

/** One `X-Robots-Tag` value: not indexed, links not followed. */
const STAGING_ROBOTS_TAG = "noindex, nofollow"

/** Staging is on only for the exact documented value; anything else is production. */
function isStaging(): boolean {
  return process.env.SITE_ENV?.trim().toLowerCase() === "staging"
}

export function proxy(): NextResponse {
  const response = NextResponse.next()

  if (isStaging()) {
    response.headers.set("X-Robots-Tag", STAGING_ROBOTS_TAG)
  }

  return response
}

/**
 * Run on documents and API responses, skip the immutable build output and the
 * favicon: `X-Robots-Tag` on a hashed CSS/JS chunk would buy nothing and would
 * put the proxy on the critical path of every asset.
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
