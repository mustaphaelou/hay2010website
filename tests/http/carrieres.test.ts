import { describe, expect, it } from "vitest"

import { assertCanonicalDocument, fetchPage, textOf } from "./helpers"
import { CAREERS_TITLE, scenario } from "./scenarios"
import {
  desktopNavigation,
  drawerNavigation,
  expectLinks,
  linksIn,
} from "./surfaces"

/**
 * Carrières over HTTP — ticket #27 acceptance:
 * - the page is reachable from the footer and never from the primary navigation
 *   (desktop row or drawer): it is a utility page, not a CDC rubrique;
 * - openings render inline from the content source, with the approved honest
 *   empty state when there are none — never a placeholder and never a detail
 *   route;
 * - the apply-by-email route follows the F-113 gate: `contact@` (questions
 *   only) until the authorization covers `recrutement@`, then the careers
 *   mailbox with the approved notice and no blank CNDP reference;
 * - no application form, no CV upload, no `JobPosting` structured data;
 * - metadata is the approved unique title/description and never leaks a gated
 *   claim before the gate opens.
 *
 * The same bodies run in every fixture scenario (`scripts/test-http.mjs`), and
 * the two gate states are simulated by the corpus: `p1`/`p2`/`p3` keep F-113
 * closed, the `p1-recrutement` scenario opens it.
 */
describe(`carrieres (${scenario.name})`, () => {
  it("is reachable from the footer and absent from the primary navigation", async () => {
    const home = await fetchPage("/")
    const { footer } = assertCanonicalDocument(home)

    const footerLinks = linksIn(footer)
    expect(
      footerLinks,
      "the footer must link Carrières as a utility page"
    ).toContainEqual({ label: "Carrières", href: "/carrieres" })

    expect(
      linksIn(desktopNavigation(home)).map((link) => link.href),
      "Carrières must never be in the desktop row"
    ).not.toContain("/carrieres")

    expect(
      linksIn(drawerNavigation(home)).map((link) => link.href),
      "Carrières must never be in the primary drawer navigation"
    ).not.toContain("/carrieres")

    const page = await fetchPage("/carrieres")
    expect(page.status, "the footer link must resolve to a published page").toBe(200)
    const canonical = assertCanonicalDocument(page)
    expect(canonical.title).toBe(CAREERS_TITLE)

    const headings = canonical.main.querySelectorAll("h1")
    expect(headings, "the page must carry exactly one h1").toHaveLength(1)
    expect(textOf(headings[0])).toBe("Carrières")
  })
})
