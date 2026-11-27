import { describe, expect, it } from "vitest"

import { assertCanonicalDocument, fetchPage, SITEMAP_ORIGIN } from "./helpers"
import { GATED_CASE_STUDY_ROUTES, scenario } from "./scenarios"

/**
 * `sitemap.xml` — ticket #32, SEO doc §6.2:
 *
 * - exactly the published, built URL set of the scenario, derived through the
 *   content seam (never a hardcoded list), with absolute apex HTTPS URLs, no
 *   trailing slash and no query;
 * - every listed URL is the canonical 200 page it claims to be;
 * - no gated URL ever: gated rubriques/domains, the gated
 *   `/realisations/{slug}` family, `/en`, the admin/API/preview surfaces,
 *   redirects, 404s/410s or assets;
 * - no fake `lastmod` (the P1 corpus has no real update date), no
 *   `changeFrequency`/`priority`, one sitemap and no image/video extension.
 */

/** Paths listed in the sitemap, read from the served XML. */
async function sitemapPaths(): Promise<{ xml: string; paths: string[] }> {
  const page = await fetchPage("/sitemap.xml")
  const xml = page.html
  expect(page.status, "the sitemap must be served").toBe(200)
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => {
    const url = new URL(match[1].trim())
    return url.pathname === "/" ? "" : url.pathname
  })
  return { xml, paths }
}

/** The path the sitemap must list for a public route (`""` for the homepage). */
function sitemapPathOf(route: string): string {
  return route === "/" ? "" : route
}

describe(`sitemap.xml (${scenario.name})`, () => {
  it("is a single urlset with exactly the published, built set", async () => {
    const { xml, paths } = await sitemapPaths()

    expect(xml, "one sitemap, no sitemap index").not.toMatch(/<sitemapindex/i)
    expect(xml.match(/<urlset/g) ?? []).toHaveLength(1)
    expect(
      [...paths].sort(),
      `sitemap must be exactly the published route set in ${scenario.name}`
    ).toEqual([...scenario.openRoutes.map(sitemapPathOf)].sort())

    // Same derivation as the content seam: the sitemap is not a second list.
    expect([...paths].sort()).toEqual([...scenario.sitemapPaths].sort())
  })

  it("lists only absolute apex HTTPS URLs without trailing slash or query", async () => {
    const { xml } = await sitemapPaths()
    const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
      match[1].trim()
    )

    for (const location of locations) {
      const url = new URL(location)
      expect(url.origin, `absolute apex origin: ${location}`).toBe(SITEMAP_ORIGIN)
      expect(url.protocol).toBe("https:")
      expect(url.search).toBe("")
      expect(url.hash).toBe("")
      expect(
        url.pathname !== "/" && url.pathname.endsWith("/"),
        `no trailing slash: ${location}`
      ).toBe(false)
      expect(location, "no protocol-relative or localhost URL").not.toMatch(
        /^(?!https:\/\/hay2010\.ma)/i
      )
    }
  })

  it("lists every URL as the canonical 200 page it claims to be", async () => {
    const { paths } = await sitemapPaths()

    for (const path of paths) {
      const route = path === "" ? "/" : path
      const page = await fetchPage(route)
      expect(page.status, `listed route ${route} must return 200`).toBe(200)
      const canonical = assertCanonicalDocument(page)
      const href =
        page.document.querySelector('link[rel="canonical"]')?.getAttribute("href") ??
        ""
      expect(href, `listed route ${route} canonical`).toBe(
        `${SITEMAP_ORIGIN}${path}`
      )
      expect(canonical.title, `listed route ${route} has a title`).not.toBe("")
    }
  })

  it("never lists a gated URL", async () => {
    const { paths } = await sitemapPaths()

    const gatedRoutes = new Set(scenario.gatedRoutes)
    const gatedPrefixes = [
      // Gated named-case-study family: any one-level child of /realisations.
      ...GATED_CASE_STUDY_ROUTES.map(() => "/realisations/"),
      ...scenario.gatedDomains.map((slug) => `/domaines-activite/${slug}`),
    ]

    for (const path of paths) {
      expect(gatedRoutes.has(path), `gated route ${path} in sitemap`).toBe(false)
      for (const prefix of gatedPrefixes) {
        expect(
          path === prefix || path.startsWith(`${prefix}/`),
          `gated family URL ${path} in sitemap`
        ).toBe(false)
      }
      // The gated family check must be real even when no fixture record exists.
      expect(path, "no case-study detail URL").not.toMatch(/^\/realisations\/.+/)
      for (const forbidden of [
        "/en",
        "/admin",
        "/api",
        "/preview",
        "/og",
        "/_next",
        "/blog",
        "/wp-",
        "/project/",
        "/company",
        "/services",
      ]) {
        expect(path === forbidden || path.startsWith(`${forbidden}/`)).toBe(false)
      }
    }
  })

  it("emits no fake lastmod, no changeFrequency and no priority", async () => {
    const { xml } = await sitemapPaths()

    expect(xml, "no build timestamp as lastModified").not.toMatch(/<lastmod>/i)
    expect(xml, "no changeFrequency").not.toMatch(/<changefreq>/i)
    expect(xml, "no priority").not.toMatch(/<priority>/i)
    expect(xml, "no image/video extension").not.toMatch(
      /image:image|video:video/i
    )
  })

  it("is crawlable: no staging header and not disallowed by robots.txt", async () => {
    const page = await fetchPage("/sitemap.xml")
    expect(page.headers.get("x-robots-tag")).toBeNull()
    expect(page.headers.get("content-type") ?? "").toMatch(/xml/i)

    const robots = await fetchPage("/robots.txt")
    expect(robots.html).toContain(`Sitemap: ${SITEMAP_ORIGIN}/sitemap.xml`)
  })
})
