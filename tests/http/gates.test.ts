import { describe, expect, it } from "vitest"

import {
  assertCanonicalDocument,
  assertNotFoundDocument,
  fetchPage,
  fetchSitemapPaths,
} from "./helpers"
import { scenario, UNKNOWN_ROUTE } from "./scenarios"
import { internalHrefs, linksIn } from "./surfaces"

/**
 * Publication gates over HTTP — ticket #21 acceptance:
 * - an open rubrique/domain route behaves as published (200 with the shell);
 * - a closed gate returns the branded 404 page with a 404 status, not a
 *   redirect and not a hollow 200;
 * - a closed entry is absent from desktop nav, drawer, footer, sitemap and
 *   every internal link rendered by the P1 route matrix;
 * - a closed route serves exactly the same 404 document as an unknown URL.
 *
 * Because `scripts/test-http.mjs` runs this file once per fixture scenario, the
 * same assertions prove the open state (p1/p2/p3) and the closed state
 * (`p1-gates-closed`) of the very same routes.
 */
describe(`publication gates (${scenario.name})`, () => {
  it("serves every open page route as a canonical document", async () => {
    for (const route of scenario.openRoutes) {
      const page = await fetchPage(route)
      expect(page.status, `${route} is published in ${scenario.name}`).toBe(200)
      assertCanonicalDocument(page)
    }
  })

  it("returns the 404 page for every closed route", async () => {
    const unknown = assertNotFoundDocument(await fetchPage(UNKNOWN_ROUTE))

    for (const route of scenario.gatedRoutes) {
      const page = await fetchPage(route)
      const signature = assertNotFoundDocument(page)
      // A closed route is indistinguishable from an unknown URL: same French
      // 404 document, same links back, no gated link. That is what "not a
      // hollow page" means at the HTTP seam.
      expect(signature.heading, `${route} must serve the 404 page`).toBe(unknown.heading)
      expect(signature.navigation, `${route} must serve the 404 navigation`).toEqual(
        unknown.navigation
      )
      expect(signature.mainLinks, `${route} must serve the 404 links`).toEqual(
        unknown.mainLinks
      )
      expect(signature.footerLinks, `${route} must serve the 404 footer`).toEqual(
        unknown.footerLinks
      )
    }
  })

  it("keeps closed routes out of the sitemap and lists exactly the published set", async () => {
    const paths = await fetchSitemapPaths()
    expect(
      [...paths].sort(),
      `sitemap must list exactly the published, built set in ${scenario.name}`
    ).toEqual([...scenario.sitemapPaths].sort())

    const gated = new Set(scenario.gatedRoutes)
    for (const path of paths) {
      expect(gated.has(path), `gated route ${path} must not be in the sitemap`).toBe(false)
      expect(path, "no English URL in the French sitemap").not.toMatch(/^\/en(\/|$)/)
      expect(path, "no admin URL in the sitemap").not.toMatch(/^\/admin(\/|$)/)
    }
  })

  it("removes closed entries from desktop nav, drawer and footer", async () => {
    const page = await fetchPage("/")
    const { header, footer } = assertCanonicalDocument(page)

    const closedHrefs = new Set(scenario.gatedRoutes)
    const surfaces = [
      ...internalHrefs(page).map((href) => ({ href, where: "document" })),
      ...header.querySelectorAll("a[href]").map((anchor) => ({
        href: anchor.getAttribute("href") ?? "",
        where: "header",
      })),
      ...footer.querySelectorAll("a[href]").map((anchor) => ({
        href: anchor.getAttribute("href") ?? "",
        where: "footer",
      })),
    ]
    const leaked = surfaces.filter((surface) => closedHrefs.has(surface.href))
    expect(leaked, "a closed route must not appear in nav/footer/document").toEqual([])
  })

  it("renders every published domain and hides the closed ones", async () => {
    for (const slug of scenario.publishedDomains) {
      const page = await fetchPage(`/domaines-activite/${slug}`)
      expect(page.status, `published domain ${slug}`).toBe(200)
      assertCanonicalDocument(page)
    }

    for (const slug of scenario.gatedDomains) {
      const page = await fetchPage(`/domaines-activite/${slug}`)
      const signature = assertNotFoundDocument(page)
      expect(signature.heading).toMatch(/introuvable/i)
      expect(
        internalHrefs(page).some((href) => href === `/domaines-activite/${slug}`),
        `a closed domain must not link to itself from its 404`
      ).toBe(false)
    }
  })

  it("serves the 404 page for an unknown domain slug", async () => {
    const page = await fetchPage("/domaines-activite/domaine-inexistant")
    assertNotFoundDocument(page)
  })

  it("links no gated URL from any published page of the route matrix", async () => {
    const gated = new Set(scenario.gatedRoutes)
    for (const route of scenario.openRoutes) {
      const page = await fetchPage(route)
      expect(page.status).toBe(200)
      const { body } = assertCanonicalDocument(page)
      const leaked = linksIn(body).filter((link) => gated.has(link.href))
      expect(leaked, `no gated link may be rendered on ${route}`).toEqual([])
    }
  })
})
