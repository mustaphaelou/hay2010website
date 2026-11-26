import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { getContentSource } from "@/lib/content"
import { isStaging } from "@/lib/flags"
import { resolveRouteGate } from "@/lib/site/route-gate"

/**
 * Request proxy — Next.js 16 renamed `middleware` to `proxy`, and the
 * project-root `proxy.ts` convention is the supported one (see the Next docs
 * "Proxy"). It runs on the Node runtime and reads `process.env` at **request**
 * time.
 *
 * Responsibilities, in order:
 *
 * 1. Staging non-indexability (#31): every staging response carries
 *    `X-Robots-Tag: noindex, nofollow` and staging serves a disallow-all
 *    `/robots.txt` (decision §7 requires both). Production is untouched, and
 *    `app/robots.ts` serves the real production rules.
 * 2. Developer surfaces are never touched: `/admin`, `/api` and `/preview`
 *    keep their behaviour (the embedded Payload admin from #29 included).
 * 3. Legacy WordPress query cleanup (#32, SEO §7.5): the old shortlink and
 *    search go home with a 301 and drop the query; every other known WP query
 *    parameter is a 410. Tracking parameters are left alone.
 * 4. Legacy 410s (#32, SEO §7.3): demo posts and date archives, the portfolio
 *    CPT records, members, taxonomies, author, feeds, WooCommerce, WP assets,
 *    the sitemap stylesheet, the filler page, pagination, search and `/blog/`
 *    until Actualités is live. 410 is a permanent retirement — no redirect, no
 *    canonical, `X-Robots-Tag: noindex`, a minimal branded body with a home
 *    link. The 301 equivalents live in `next.config.ts` because redirects run
 *    before the proxy.
 * 5. Publication gates (#21): a closed rubrique/domain is rewritten to the
 *    site's 404 document and served with a 404 status — the real branded 404,
 *    not a redirect and not a hollow shell. Page files keep
 *    `requirePublishedRubrique()` as the render guard
 *    (docs/build/content-seam.md §5). Keep the gate lookup cheap: one content
 *    source call per known route, no rendering.
 */
const STAGING_ROBOTS_TAG = "noindex, nofollow"

/** Staging-only robots.txt; #32 serves the production rules in `app/robots.ts`. */
const STAGING_ROBOTS_TXT = "User-agent: *\nDisallow: /\n"

/** Developer surfaces: never redirect, rewrite or 410 them. */
const DEVELOPER_SURFACE = /^\/(?:admin|api|preview)(?:\/|$)/

/**
 * Case variants of the old WordPress pages (§7.6). The old site served them with
 * 200 and a lowercase self-canonical, so they must 301 to the new equivalent.
 * They are handled here, not in `next.config.ts`, because Next's redirect
 * sources match case-insensitively: a `/CONTACT` source would also match the
 * canonical `/contact` and self-redirect. Exact, case-sensitive matching.
 */
const CASE_VARIANTS: Readonly<Record<string, string>> = {
  "/Company": "/a-propos",
  "/Company/": "/a-propos",
  "/SERVICES": "/domaines-activite",
  "/SERVICES/": "/domaines-activite",
  "/PROJECTS": "/realisations",
  "/PROJECTS/": "/realisations",
  "/CONTACT": "/contact",
  "/CONTACT/": "/contact",
}

/**
 * Old WordPress query parameters (§7.5). `p=143` and `s` are handled first
 * because they keep value; any other use of these keys is a 410.
 */
const LEGACY_WP_QUERY_KEYS = [
  "p",
  "page_id",
  "cat",
  "author",
  "m",
  "attachment_id",
  "preview",
  "wc-ajax",
  "replytocom",
  "share",
  "customize_changeset_uuid",
] as const

/**
 * Paths that are permanently gone (§7.3), matched on the slash-normalised form.
 * Exact-equivalents are 301s in `next.config.ts`; this list is only what has no
 * replacement and must never come back.
 */
const GONE_PATH_PATTERNS: readonly RegExp[] = [
  // Demo posts and date archives (§7.3): any path under a four-digit year.
  /^\/(?:19|20)\d{2}(?:\/.*)?$/,
  // Portfolio CPT records — `/project` and `/project/` are 301s to /realisations.
  /^\/project\/[^/]+$/,
  // Member CPT, taxonomies, author.
  /^\/member(?:\/.*)?$/,
  /^\/category(?:\/.*)?$/,
  /^\/tag(?:\/.*)?$/,
  /^\/author(?:\/.*)?$/,
  // Feeds and comments feeds (no RSS at launch).
  /^\/feed(?:\/.*)?$/,
  /^\/comments\/feed(?:\/.*)?$/,
  // WooCommerce surface (no e-commerce).
  /^\/shop(?:\/.*)?$/,
  /^\/cart$/,
  /^\/my-account$/,
  /^\/checkout$/,
  /^\/product(?:\/.*)?$/,
  /^\/product-category(?:\/.*)?$/,
  // Demo assets, sitemap stylesheet and the default filler page.
  /^\/wp-content(?:\/.*)?$/,
  /^\/wp-includes(?:\/.*)?$/,
  /^\/sitemaps\.xsl$/,
  /^\/sample-page$/,
  // Pagination at the root and old search routes.
  /^\/page\/\d+$/,
  /^\/search(?:\/.*)?$/,
]

/** Reduce a pathname to the canonical no-slash form used by the maps. */
function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.replace(/\/+$/, "")
  }
  return pathname
}

/** Attach the staging noindex directive to a response when needed. */
function markStaging(response: NextResponse, staging: boolean): NextResponse {
  if (staging) response.headers.set("X-Robots-Tag", STAGING_ROBOTS_TAG)
  return response
}

/** Permanent redirect to a site path, keeping no query. */
function permanentRedirect(request: NextRequest, path: string): NextResponse {
  return NextResponse.redirect(new URL(path, request.url), 301)
}

/**
 * The 410 document: permanent retirement. Minimal, French, branded with the
 * ink/paper tokens, one home link, no canonical, noindex, never cached.
 */
function goneResponse(staging: boolean): NextResponse {
  const body = `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <title>Page retirée — HAY2010</title>
    <style>
      body { margin: 0; background: #111217; color: #F7F6F1; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; }
      main { max-width: 40rem; margin: 0 auto; padding: 20vh 1.5rem 0; }
      p { color: rgba(247, 246, 241, 0.72); line-height: 1.65; }
      a { color: #F7F6F1; text-underline-offset: 0.25em; }
    </style>
  </head>
  <body>
    <main>
      <h1>Page retirée</h1>
      <p>Cette adresse n’est plus disponible. Elle appartient à une ancienne version du site et ne sera pas rétablie.</p>
      <p><a href="/">Retour à l’accueil</a></p>
    </main>
  </body>
</html>
`
  return new NextResponse(body, {
    status: 410,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": staging ? "noindex, nofollow" : "noindex",
    },
  })
}

/**
 * Are Actualités live? The `/blog/` family 410s until the new rubrique is
 * published **and** has a page document (`actualitesLive`, SEO §7.3/§8.6), then
 * it 301s to `/actualites`. The publish state comes from the content seam, so
 * #30 opens it with content, not with code.
 */
async function actualitesLive(): Promise<boolean> {
  const source = await getContentSource()
  const [state, page] = await Promise.all([
    source.getPublishState("actualites"),
    source.getPage("actualites"),
  ])
  return state.published && page !== null
}

/**
 * The legacy query outcome of a request: `home` (301 to `/`, query dropped),
 * `gone` (410) or `null` (not a legacy WP query).
 */
function legacyQueryOutcome(request: NextRequest): "home" | "gone" | null {
  const { searchParams } = request.nextUrl
  const path = normalizePathname(request.nextUrl.pathname)

  // Old home shortlink: keep the value, land on the homepage.
  if (path === "/" && searchParams.get("p") === "143") return "home"
  // Old search: the homepage keeps the value, other paths are dead search URLs.
  if (searchParams.has("s")) return path === "/" ? "home" : "gone"
  // Any other legacy WP query parameter is old routing that will not return.
  if (LEGACY_WP_QUERY_KEYS.some((key) => searchParams.has(key))) return "gone"
  return null
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const staging = isStaging()
  const pathname = request.nextUrl.pathname

  // Short-circuit before the filesystem routes: on staging this wins even
  // though #32 adds `app/robots.ts`, and the production branch stays untouched.
  if (staging && pathname === "/robots.txt") {
    return new NextResponse(STAGING_ROBOTS_TXT, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Robots-Tag": STAGING_ROBOTS_TAG,
      },
    })
  }

  // Never intercept the developer surfaces: /admin (Payload), /api (health)
  // and /preview keep their own behaviour and status codes.
  if (DEVELOPER_SURFACE.test(pathname)) {
    return markStaging(NextResponse.next(), staging)
  }

  // Case variants of old pages (§7.6), before any generic normalisation.
  const caseTarget = CASE_VARIANTS[pathname]
  if (caseTarget) return permanentRedirect(request, caseTarget)

  // Legacy WordPress query cleanup (§7.5). A redirect cannot drop the incoming
  // query string in `next.config.ts`, so these 301s live here.
  const query = legacyQueryOutcome(request)
  if (query === "home") return permanentRedirect(request, "/")
  if (query === "gone") return goneResponse(staging)

  // `/blog/` and children: 410 until Actualités is live, then 301 (§7.3).
  const path = normalizePathname(pathname)
  if (path === "/blog" || path.startsWith("/blog/")) {
    if (await actualitesLive()) return permanentRedirect(request, "/actualites")
    return goneResponse(staging)
  }

  // Legacy 410 map (§7.3). Checked before normalisation so `/blog/` is a single
  // direct 410 rather than a 308 hop.
  if (GONE_PATH_PATTERNS.some((pattern) => pattern.test(path))) {
    return goneResponse(staging)
  }

  // Generic trailing-slash normalisation (§2.3, §7.7): Next's automatic 308 is
  // disabled so the explicit legacy slash sources answer 301 directly; every
  // other trailing-slash request is normalised here, permanently, query kept.
  if (pathname !== "/" && pathname.endsWith("/")) {
    // Build the absolute string, not a cloned NextURL: its cached slash flag
    // would re-add the trailing slash when the Location header is formatted.
    const target = `${normalizePathname(pathname)}${request.nextUrl.search}`
    return markStaging(
      NextResponse.redirect(new URL(target, request.url), 308),
      staging
    )
  }

  // Publication gate: closed routes serve the branded 404 document with a 404
  // status. Unknown routes are left to the router/global-not-found.
  if ((await resolveRouteGate(pathname)) === "closed") {
    const url = request.nextUrl.clone()
    url.pathname = "/_not-found"
    url.search = ""
    return markStaging(NextResponse.rewrite(url), staging)
  }

  return markStaging(NextResponse.next(), staging)
}

/**
 * Run on documents and API responses; skip the immutable build output. A robots
 * header on a hashed CSS/JS chunk would buy nothing and would put the proxy on
 * the critical path of every asset.
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
}
