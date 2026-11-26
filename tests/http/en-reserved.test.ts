import { describe, expect, it } from "vitest"

import { assertCanonicalDocument, fetchPage } from "./helpers"
import { scenario } from "./scenarios"
import { internalHrefs } from "./surfaces"

/**
 * `/en` is reserved for the P2 English version — ticket #21 acceptance:
 * - French routes stay prefix-free (no `/fr` rewrite, no root `[lang]`);
 * - `/en` is currently unavailable: it returns 404, not a redirect and not a
 *   silent fallback to French;
 * - no hreflang and no English document is served at P1.
 *
 * When P2 adds the English build it will live in an `app/en` route group
 * (documented in docs/build/content-seam.md); this suite then flips the `/en`
 * expectation from 404 to 200 without moving the French URLs.
 */
describe(`reserved /en root (${scenario.name})`, () => {
  it("returns 404 for /en, not a redirect and not a French fallback", async () => {
    const page = await fetchPage("/en")
    expect(page.status).toBe(404)
    expect(page.headers.get("location")).toBeNull()
    // The response is the site's French 404 document (every document on the
    // site is French at P1); what matters is that /en is not a route.
    expect(page.document.querySelector("h1")?.text ?? "").toMatch(/introuvable/i)
  })

  it("keeps French routes prefix-free", async () => {
    const home = await fetchPage("/")
    expect(home.status).toBe(200)

    // No /fr alias: the French site is served at the root only.
    const frenchAlias = await fetchPage("/fr")
    expect(frenchAlias.status).toBe(404)
  })

  it("renders no hreflang alternates and no English language attribute", async () => {
    for (const route of ["/", ...scenario.openRoutes]) {
      const page = await fetchPage(route === "" ? "/" : route)
      expect(page.status, `${route} must be served`).toBe(200)

      const alternates = page.document.querySelectorAll("link[rel='alternate'][hreflang]")
      expect(alternates, `no hreflang on ${route}`).toHaveLength(0)

      const lang = page.document.querySelector("html")?.getAttribute("lang")
      expect(lang, `the document language on ${route}`).toBe("fr")
    }
  })

  it("never links to an English or prefixed French URL", async () => {
    const home = await fetchPage("/")
    assertCanonicalDocument(home)
    for (const href of internalHrefs(home)) {
      expect(href).not.toMatch(/^\/(en|fr)(\/|$)/)
    }
  })
})
