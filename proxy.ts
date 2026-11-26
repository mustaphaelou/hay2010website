import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { isStaging } from "@/lib/flags"

/**
 * Request proxy — Next.js 16 renamed `middleware` to `proxy`, and the project-root
 * `proxy.ts` convention is the supported one (see the Next docs "Proxy"). It runs
 * on the Node runtime and reads `process.env` at **request** time, which is why one
 * image built in CI can serve staging (non-indexable) and later production.
 *
 * Current responsibility, deliberately minimal: make every response from a
 * staging deployment non-indexable, and serve a disallow-all `/robots.txt` on
 * staging (decision §7 requires both). Production behaviour is untouched.
 *
 * EXTENSION POINT — ticket #32 owns the crawler surface and the legacy URL map:
 * legacy WordPress 301/410 redirects and trailing-slash normalisation belong in
 * this file, before the header logic. Contract: keep the staging header branch
 * and the staging robots short-circuit, and do not rewrite `/admin` or
 * `/api/*` in a way that changes behaviour (the header on API responses is
 * deliberate and harmless). Do not add `app/sitemap.ts` here.
 */

/** One `X-Robots-Tag` value: not indexed, links not followed. */
const STAGING_ROBOTS_TAG = "noindex, nofollow"

/** Staging-only robots.txt; #32 owns the production rules in `app/robots.ts`. */
const STAGING_ROBOTS_TXT = "User-agent: *\nDisallow: /\n"

export function proxy(request: NextRequest): NextResponse {
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
