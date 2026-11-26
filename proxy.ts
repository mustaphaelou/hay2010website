import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { isStaging } from "@/lib/flags"
import { resolveRouteGate } from "@/lib/site/route-gate"

/**
 * Request proxy — Next.js 16 renamed `middleware` to `proxy`, and the project-root
 * `proxy.ts` convention is the supported one (see the Next docs "Proxy"). It runs
 * on the Node runtime and reads `process.env` at **request** time.
 *
 * Two responsibilities, in this order:
 *
 * 1. Publication gates (#21): a closed rubrique/domain is rewritten to the
 *    site's 404 document and served with a 404 status — the real branded 404,
 *    not a redirect and not a hollow shell. Page files keep
 *    `requirePublishedRubrique()` as the render guard
 *    (docs/build/content-seam.md §5). Keep the gate lookup cheap: one content
 *    source call per known route, no rendering.
 * 2. Staging non-indexability (#31): every staging response carries
 *    `X-Robots-Tag: noindex, nofollow` and staging serves a disallow-all
 *    `/robots.txt` (decision §7 requires both). Production is untouched.
 *
 * EXTENSION POINT — ticket #32 owns the crawler surface and the legacy URL map:
 * legacy WordPress 301/410 redirects and trailing-slash normalisation belong in
 * this file, before the gate/header logic. Contract: keep the staging header
 * branch and the staging robots short-circuit, keep the gate branch, and do not
 * rewrite `/admin` or `/api/*` in a way that changes behaviour. Do not add
 * `app/sitemap.ts` here.
 */

/** One `X-Robots-Tag` value: not indexed, links not followed. */
const STAGING_ROBOTS_TAG = "noindex, nofollow"

/** Staging-only robots.txt; #32 owns the production rules in `app/robots.ts`. */
const STAGING_ROBOTS_TXT = "User-agent: *\nDisallow: /\n"

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const staging = isStaging()

  // Short-circuit before the filesystem routes: on staging this wins even after
  // #32 adds `app/robots.ts`, and the production branch stays untouched.
  if (staging && request.nextUrl.pathname === "/robots.txt") {
    return new NextResponse(STAGING_ROBOTS_TXT, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Robots-Tag": STAGING_ROBOTS_TAG,
      },
    })
  }

  // Publication gate: closed routes serve the branded 404 document with a 404
  // status. Unknown routes are left to the router/global-not-found.
  if ((await resolveRouteGate(request.nextUrl.pathname)) === "closed") {
    const url = request.nextUrl.clone()
    url.pathname = "/_not-found"
    url.search = ""
    const rewrite = NextResponse.rewrite(url)
    if (staging) rewrite.headers.set("X-Robots-Tag", STAGING_ROBOTS_TAG)
    return rewrite
  }

  const response = NextResponse.next()
  if (staging) {
    response.headers.set("X-Robots-Tag", STAGING_ROBOTS_TAG)
  }
  return response
}

/**
 * Run on documents and API responses; skip the immutable build output. A robots
 * header on a hashed CSS/JS chunk would buy nothing and would put the proxy on
 * the critical path of every asset.
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
}
