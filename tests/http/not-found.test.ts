import { describe, expect, it } from "vitest"

import {
  assertCanonicalDocument,
  assertNotFoundDocument,
  fetchPage,
} from "./helpers"
import { scenario, UNKNOWN_ROUTE } from "./scenarios"
import { expectLinks, internalLinksIn } from "./surfaces"

/**
 * The 404 page over HTTP — ticket #21 acceptance:
 * - an unknown URL returns a 404 status (not a redirect, not a 200 app shell);
 * - the page is French, carries the one canonical document shell and is
 *   `noindex`;
 * - it routes visitors back to the published main rubriques, derived from the
 *   registry, so a gated rubrique is never suggested.
 */
describe(`not-found page (${scenario.name})`, () => {
  it("serves a real French 404 document for an unknown URL", async () => {
    const page = await fetchPage(UNKNOWN_ROUTE)
    assertNotFoundDocument(page)
  })

  it("returns 404, not a redirect and not a 200 shell", async () => {
    const page = await fetchPage(UNKNOWN_ROUTE)
    expect(page.status).toBe(404)
    expect(page.headers.get("location")).toBeNull()
    expect(page.headers.get("content-type") ?? "").toMatch(/text\/html/)
  })

  it("links back to every published main rubrique", async () => {
    const page = await fetchPage(UNKNOWN_ROUTE)
    assertNotFoundDocument(page)

    const heading = page.document.querySelector("h1")?.text ?? ""
    expect(heading.length, "the 404 page must explain itself").toBeGreaterThan(0)

    // The links back live in the 404 content's own navigation.
    const backNav = page.document.querySelector('main nav[aria-label="Retour aux rubriques"]')
    expect(backNav, "the 404 page must offer a way back").not.toBeNull()

    if (!backNav) throw new Error("missing 404 back navigation")
    const links = internalLinksIn(backNav)
    expectLinks(links, scenario.navigation, "404 links back")
  })

  it("suggests no gated rubrique", async () => {
    const page = await fetchPage(UNKNOWN_ROUTE)
    assertNotFoundDocument(page)

    const main = page.document.querySelector("main")
    if (!main) throw new Error("missing main landmark")
    const mainHrefs = internalLinksIn(main).map((link) => link.href)
    for (const gated of scenario.gatedRoutes) {
      expect(mainHrefs, `the 404 page must not link ${gated}`).not.toContain(gated)
    }
  })

  it("is noindex and keeps the canonical French document", async () => {
    const page = await fetchPage(UNKNOWN_ROUTE)
    const canonical = assertCanonicalDocument(page)
    expect(canonical.html.getAttribute("lang")).toBe("fr")
    expect(canonical.title).toMatch(/introuvable/i)

    const robots = page.document
      .querySelector('meta[name="robots"]')
      ?.getAttribute("content")
      ?.toLowerCase()
    expect(robots ?? "").toContain("noindex")
  })
})
