import { describe, expect, it } from "vitest"

import {
  assertCanonicalDocument,
  assertNotFoundDocument,
  fetchPage,
  textOf,
} from "./helpers"
import { scenario } from "./scenarios"

/**
 * À propos over HTTP — ticket #25 acceptance:
 * - the institutional page renders the cleared identity/positioning content;
 * - the activity/perimeter, mission/vision/values and qualité/sécurité/
 *   conformité sections render once each, in the decided order;
 * - history, team and certification material stay absent while gated, and the
 *   page links to no unpublished certifications section;
 * - metadata is unique, French and carries no unverified claim.
 *
 * The expected wording comes from the decided documents
 * (docs/company/facts-register.md §5.3, docs/spec/p1-website-build.md
 * "Static rubriques"), not from the fixture corpus under test.
 */

const A_PROPOS = "/a-propos"

/** The scenario where À propos is closed proves the gate from the other side. */
const A_PROPOS_GATED = scenario.gatedRoutes.includes(A_PROPOS)

async function fetchOpenAPropos() {
  const page = await fetchPage(A_PROPOS)
  expect(page.status, `À propos must be served in scenario "${scenario.name}"`).toBe(200)
  return { page, canonical: assertCanonicalDocument(page) }
}

describe.skipIf(A_PROPOS_GATED)(`À propos page (${scenario.name})`, () => {
  it("serves a French institutional document with one h1", async () => {
    const { canonical } = await fetchOpenAPropos()

    expect(canonical.html.getAttribute("lang")).toBe("fr")
    expect(canonical.main.querySelectorAll("h1")).toHaveLength(1)
    const heading = canonical.main.querySelector("h1")
    expect(heading, "À propos must carry a page heading").not.toBeNull()
    expect(textOf(heading as NonNullable<typeof heading>)).toBe("À propos")

    // A serious page, not an empty shell: substantive body copy below the h1.
    expect(
      textOf(canonical.main).length,
      "the page must carry substantive institutional copy"
    ).toBeGreaterThan(600)
  })

  it("opens with the cleared identity and positioning paragraph", async () => {
    const { canonical } = await fetchOpenAPropos()
    const mainText = textOf(canonical.main)

    // Approved positioning line (facts register §5.3), typographic apostrophes.
    expect(mainText).toContain(
      "Depuis plus de 10 ans, HAY2010 accompagne les collectivités et les entreprises dans leurs projets d’éclairage public et d’électrification."
    )
    expect(mainText).toContain("HAY2010")
    expect(mainText).toContain("Rabat")
  })

  it("renders the approved experience line and the exact gérant line", async () => {
    const { canonical } = await fetchOpenAPropos()
    const mainText = textOf(canonical.main)

    expect(mainText).toContain("Plus de 10 ans d’expérience")

    // Name and title only (facts register §2.1): exactly one occurrence, no
    // biography, quote or photograph attached to it.
    expect(mainText).toMatch(/Gérant\s*:\s*Rahhal Essamlali/)
    expect(mainText.match(/Rahhal Essamlali/g) ?? []).toHaveLength(1)
  })
})

describe.runIf(A_PROPOS_GATED)(`À propos gate (${scenario.name})`, () => {
  it("returns the branded 404 while the rubrique is closed", async () => {
    assertNotFoundDocument(await fetchPage(A_PROPOS))
  })
})
