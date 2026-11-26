import { describe, expect, it } from "vitest"

import { baseUrl, fetchPage, SITEMAP_ORIGIN } from "./helpers"
import { scenario } from "./scenarios"

/**
 * Legacy WordPress URL map — ticket #32, SEO doc §7:
 *
 * - §7.2: every equivalent that keeps value is a **301** to the decided new
 *   route, for the slash and no-slash source and the case variants the old
 *   WordPress served with 200;
 * - §7.3: demo content and dead structures are **410** (no `Location`, minimal
 *   branded HTML, `X-Robots-Tag: noindex`) — posts, date archives, portfolio
 *   CPT, members, taxonomies, author, feeds, WooCommerce, WP assets, sitemap
 *   stylesheet, filler page, pagination, search and `/blog/` until Actualités
 *   is live;
 * - §7.5: WordPress query strings are handled (`/?p=143` and `/?s=` → 301
 *   home, the other `?p=`/`?page_id=`/… → 410, tracking parameters untouched);
 * - §2.3/§7.7: generic trailing-slash normalisation is permanent (Next 308)
 *   and explicit legacy paths use 301; a 301 always lands on a 200;
 * - no redirect target is gated, no chain loops, and `/api`/`/admin` are never
 *   intercepted.
 *
 * The 301 table is the decided map, not a copy of the implementation.
 */

interface Redirect {
  readonly source: string
  readonly target: string
}

/** §7.2 equivalent paths that keep value — 301, slash/no-slash and case. */
const REDIRECTS_301: readonly Redirect[] = [
  // Pages
  { source: "/company", target: "/a-propos" },
  { source: "/company/", target: "/a-propos" },
  { source: "/Company", target: "/a-propos" },
  { source: "/Company/", target: "/a-propos" },
  { source: "/services", target: "/domaines-activite" },
  { source: "/services/", target: "/domaines-activite" },
  { source: "/SERVICES", target: "/domaines-activite" },
  { source: "/SERVICES/", target: "/domaines-activite" },
  { source: "/services/pre-construction", target: "/domaines-activite" },
  { source: "/services/pre-construction/", target: "/domaines-activite" },
  { source: "/services/general-construction", target: "/domaines-activite" },
  { source: "/services/general-construction/", target: "/domaines-activite" },
  { source: "/services/plumbing", target: "/domaines-activite" },
  { source: "/services/plumbing/", target: "/domaines-activite" },
  { source: "/services/painting", target: "/domaines-activite" },
  { source: "/services/painting/", target: "/domaines-activite" },
  { source: "/projects", target: "/realisations" },
  { source: "/projects/", target: "/realisations" },
  { source: "/PROJECTS", target: "/realisations" },
  { source: "/PROJECTS/", target: "/realisations" },
  { source: "/project", target: "/realisations" },
  { source: "/project/", target: "/realisations" },
  { source: "/contact/", target: "/contact" },
  { source: "/CONTACT", target: "/contact" },
  { source: "/CONTACT/", target: "/contact" },
  // Old sitemap files and the robots file path
  { source: "/sitemaps.xml", target: "/sitemap.xml" },
  { source: "/sitemaps.xml/", target: "/sitemap.xml" },
  { source: "/sitemap_index.xml", target: "/sitemap.xml" },
  { source: "/sitemap_index.xml/", target: "/sitemap.xml" },
  { source: "/wp-sitemap.xml", target: "/sitemap.xml" },
  { source: "/wp-sitemap.xml/", target: "/sitemap.xml" },
  { source: "/page-sitemap1.xml", target: "/sitemap.xml" },
  { source: "/page-sitemap1.xml/", target: "/sitemap.xml" },
  { source: "/post-sitemap1.xml", target: "/sitemap.xml" },
  { source: "/post-sitemap1.xml/", target: "/sitemap.xml" },
  { source: "/category-sitemap1.xml", target: "/sitemap.xml" },
  { source: "/category-sitemap1.xml/", target: "/sitemap.xml" },
  { source: "/robots.txt/", target: "/robots.txt" },
  { source: "/sitemap.xml/", target: "/sitemap.xml" },
] as const

/** §7.2 query redirects: legacy shortlink and search go home, query dropped. */
const QUERY_REDIRECTS_301 = ["/?p=143", "/?s=test", "/?s="] as const

/** §7.3 demo content / dead structures — 410, never a `Location`. */
const GONE_410: readonly string[] = [
  // Demo posts and date archives
  "/2026/02/16/hello-world/",
  "/2016/07/22/lorem-ipsum-dolor-sit-amet/",
  "/2016/07/23/the-construction-business/",
  "/2026/",
  "/2016/07/",
  "/2016/07/23/",
  "/2016/07/23/the-construction-business/",
  // Portfolio CPT (the archive `/project/` is a 301 above)
  "/project/one-lofts/",
  "/project/marina-building/",
  "/project/okler-mansion/",
  // Member CPT, taxonomies, author
  "/member/john-doe/",
  "/member/monica-doe/",
  "/category/news/",
  "/category/duis/",
  "/category/uncategorized/",
  "/tag/demo/",
  "/author/elouardi/",
  // Feeds
  "/feed/",
  "/comments/feed/",
  "/feed/atom/",
  "/feed/rss2/",
  "/feed",
  // WooCommerce surface
  "/shop/",
  "/shop/product/demo/",
  "/cart/",
  "/my-account/",
  "/checkout/",
  "/product/demo/",
  "/product-category/demo/",
  // WordPress assets, stylesheet and filler
  "/wp-content/uploads/2026/01/demo.jpg",
  "/wp-includes/css/dist/block-library/style.css",
  "/sitemaps.xsl",
  "/sample-page/",
  // Pagination and search
  "/page/2/",
  "/page/17/",
  "/search/test/",
  // Blog until Actualités is live (SEO §7.3/§8.6)
  "/blog/",
] as const

/** §7.3/§7.5 query strings that are 410 (old WP routing, not tracking). */
const QUERY_410 = [
  "/?p=999",
  "/?page_id=2",
  "/?cat=3",
  "/?author=elouardi",
  "/?m=201607",
  "/?attachment_id=4",
  "/?preview=true",
  "/?wc-ajax=checkout",
  "/?replytocom=1",
  "/?share=twitter",
  "/?customize_changeset_uuid=abc",
  "/contact/?s=test",
] as const

/** Tracking parameters are legitimate: the page renders 200, canonical strips. */
const TRACKING_QUERIES = [
  "/?utm_source=test&utm_medium=email",
  "/a-propos?fbclid=abc",
  "/contact?gclid=xyz",
] as const

/** §7.4 WordPress internals: not 200 at the origin; the router's 404 applies. */
const WP_INTERNALS_404 = [
  "/wp-login.php",
  "/wp-json/",
  "/xmlrpc.php",
  "/wp-admin/",
] as const

interface ObservedRedirect {
  status: number
  location: URL | null
}

/** One request without following redirects. */
async function observe(path: string): Promise<ObservedRedirect> {
  const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" })
  const header = response.headers.get("location")
  return {
    status: response.status,
    location: header ? new URL(header, `${baseUrl}/`) : null,
  }
}

interface TerminalResponse {
  /** The terminal (non-redirect) status. */
  status: number
  headers: Headers
  text: string
  /** Status of the first response, to prove what happened on the wire. */
  firstStatus: number
  /** Location of the first response, if it redirected. */
  firstLocation: URL | null
  hops: number
}

/**
 * Follow up to two permanent hops and return the terminal response. The first
 * hop may be Next's generic trailing-slash normalisation (a permanent 308):
 * that is allowed for slash variants, an equivalent 301 is not — the map's
 * 301s are asserted with `observe` instead.
 */
async function fetchTerminal(
  path: string,
  maxHops = 2
): Promise<TerminalResponse> {
  let url = new URL(path, `${baseUrl}/`)
  let firstStatus = 0
  let firstLocation: URL | null = null
  for (let hops = 0; hops <= maxHops; hops += 1) {
    const response = await fetch(url, { redirect: "manual" })
    const location = response.headers.get("location")
    if (hops === 0) {
      firstStatus = response.status
      firstLocation = location ? new URL(location, url) : null
    }
    if (response.status >= 300 && response.status < 400 && location) {
      url = new URL(location, url)
      continue
    }
    return {
      status: response.status,
      headers: response.headers,
      text: await response.text(),
      firstStatus,
      firstLocation,
      hops,
    }
  }
  throw new Error(`${path} did not terminate after ${maxHops} hops`)
}

function pathOf(url: URL): string {
  return url.pathname === "/" ? "" : url.pathname
}

describe(`legacy WordPress URL map (${scenario.name})`, () => {
  it("301s every equivalent old address to its decided new route", async () => {
    for (const { source, target } of REDIRECTS_301) {
      const observed = await observe(source)
      expect(observed.status, `${source} must be a 301`).toBe(301)
      expect(observed.location, `${source} must carry a Location`).not.toBeNull()
      const location = observed.location as URL
      expect(pathOf(location), `${source} redirect target`).toBe(target)
      // The Location is served as a path (resolved against the request host);
      // if absolute it must never point at another origin than the site.
      expect(
        [SITEMAP_ORIGIN, baseUrl].includes(location.origin),
        `${source} must not redirect off-site`
      ).toBe(true)
      expect(location.search, `${source} redirect target keeps no query`).toBe("")

      // A 301 must land on a 200, never on a 404/410, a chain or a gated page.
      const destination = await fetchPage(target)
      expect(destination.status, `301 target ${target} must return 200`).toBe(200)
    }
  })

  it("301s the legacy shortlink and search queries to the homepage", async () => {
    for (const source of QUERY_REDIRECTS_301) {
      const observed = await observe(source)
      expect(observed.status, `${source} must be a 301`).toBe(301)
      const location = observed.location as URL
      expect(location.pathname, `${source} must drop the query`).toBe("/")
      expect(location.search, `${source} must not carry the old query`).toBe("")
    }
  })

  it("410s demo content and dead structures with no redirect", async () => {
    for (const path of GONE_410) {
      const terminal = await fetchTerminal(path)
      expect(
        terminal.status,
        `${path} must be 410 (directly or after trailing-slash normalisation)`
      ).toBe(410)
      expect(
        terminal.headers.get("x-robots-tag") ?? "",
        `${path} 410 must be noindex`
      ).toMatch(/noindex/i)
      // The only hop a 410 may take is the generic no-slash normalisation.
      if (terminal.firstStatus >= 300 && terminal.firstStatus < 400) {
        expect(
          [301, 308],
          `${path} normalisation hop must be permanent`
        ).toContain(terminal.firstStatus)
        expect(
          pathOf(terminal.firstLocation as URL),
          `${path} may only normalise its trailing slash`
        ).toBe(path.replace(/\/+$/, ""))
      }

      // A 410 body is minimal, branded and links home: no canonical, no
      // navigation, no redirect.
      expect(terminal.text, `${path} 410 body must be HTML`).toMatch(/<html/i)
      expect(
        terminal.text,
        `${path} 410 body must be French`
      ).toMatch(/retirée|plus disponible/i)
      expect(terminal.text, `${path} 410 body links home`).toMatch(/href="\/"/)
      expect(
        terminal.text,
        `${path} 410 body has no canonical`
      ).not.toMatch(/rel="canonical"/)
    }
  })

  it("410s WordPress query strings that are not tracking parameters", async () => {
    for (const path of QUERY_410) {
      const terminal = await fetchTerminal(path)
      expect(terminal.status, `${path} must be 410`).toBe(410)
      expect(terminal.headers.get("location")).toBeNull()
      expect(terminal.headers.get("x-robots-tag") ?? "").toMatch(/noindex/i)
    }
  })

  it("leaves tracking parameters alone: 200 with the page, not a redirect", async () => {
    for (const path of TRACKING_QUERIES) {
      const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" })
      expect(response.status, `${path} must render the page`).toBe(200)
      expect(response.headers.get("location")).toBeNull()
    }
  })

  it("normalises trailing-slash variants permanently to the no-slash URL", async () => {
    const pages = ["/a-propos/", "/domaines-activite/", "/realisations/", "/carrieres/"]
    for (const path of pages) {
      const observed = await observe(path)
      expect(
        [301, 308],
        `${path} must be a permanent redirect`
      ).toContain(observed.status)
      const location = observed.location as URL
      expect(pathOf(location), `${path} normalises`).toBe(path.replace(/\/$/, ""))
      expect(
        (await fetchPage(path.replace(/\/$/, ""))).status,
        `${path} target must be 200`
      ).toBe(200)
    }

    // A gated route keeps its 404 after normalisation: never a redirect to a
    // page that would 404 or a gated page.
    for (const path of scenario.gatedRoutes) {
      const final = await fetch(`${baseUrl}${path}/`, { redirect: "follow" })
      expect(final.status, `${path}/ final status`).toBe(404)
    }
  })

  it("never redirects to a gated URL", async () => {
    const gated = new Set(scenario.gatedRoutes)
    for (const source of REDIRECTS_301.map((redirect) => redirect.source)) {
      const observed = await observe(source)
      const location = observed.location as URL
      expect(
        gated.has(pathOf(location)),
        `${source} must not redirect to a gated route`
      ).toBe(false)
      expect(pathOf(location), "no redirect to the reserved /en").not.toMatch(
        /^\/en(\/|$)/
      )
      expect(pathOf(location), "no redirect to the admin/API surface").not.toMatch(
        /^\/(?:admin|api|preview)(\/|$)/
      )
    }
  })

  it("does not intercept or change /api or /admin behaviour", async () => {
    // The health endpoint keeps answering JSON, never a 410 or a legacy 301.
    const health = await fetch(`${baseUrl}/api/health`, { redirect: "manual" })
    expect(health.status).toBe(200)
    expect(health.headers.get("content-type") ?? "").toMatch(/application\/json/)
    expect(health.headers.get("location")).toBeNull()

    // /admin is a developer surface: whatever its auth/route state, the legacy
    // map must not rewrite it to a public page.
    const admin = await fetch(`${baseUrl}/admin`, { redirect: "manual" })
    expect(admin.status, "/admin must not be a legacy 410").not.toBe(410)
    const location = admin.headers.get("location")
    if (location) {
      expect(pathOf(new URL(location, baseUrl))).not.toMatch(
        /^\/(?:a-propos|domaines-activite|realisations|contact)/
      )
    }
  })

  it("does not serve WordPress internals as a page", async () => {
    for (const path of WP_INTERNALS_404) {
      const terminal = await fetchTerminal(path)
      expect(terminal.status, `${path} must end on the 404 document`).toBe(404)
      // The only hop allowed is the generic no-slash normalisation.
      if (terminal.firstStatus >= 300 && terminal.firstStatus < 400) {
        expect(pathOf(terminal.firstLocation as URL)).toBe(
          path.replace(/\/+$/, "")
        )
      }
    }
  })
})
