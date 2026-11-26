import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { resolveRouteGate } from "@/lib/site/route-gate"

/**
 * Gate enforcement before rendering (see docs/build/content-seam.md §"Gate
 * semantics").
 *
 * A closed rubrique or domain is rewritten to the site's 404 document and
 * served with a 404 status: the visitor and the crawler get the real branded
 * 404 page — not a redirect, not a 200 shell and not a hollow page. The page
 * files keep `requirePublishedRubrique()` as the second layer.
 *
 * The matcher skips Next internals and assets (any path with a dot), and the
 * reserved Payload surface (`/admin`, `/api`) that ticket #29 adds.
 *
 * This module must stay cheap: it resolves one gate lookup from the content
 * source and never renders. #29/#30 may back the source with Postgres — keep
 * the gate lookup indexed, or keep the CMS gate decision in the page layer and
 * let the proxy only consult code-owned tier gates.
 */
export const config = {
  matcher: "/((?!_next/|admin|api|.*\\..*).*)",
}

export async function proxy(request: NextRequest) {
  const gate = await resolveRouteGate(request.nextUrl.pathname)
  if (gate !== "closed") return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = "/_not-found"
  url.search = ""
  return NextResponse.rewrite(url)
}
