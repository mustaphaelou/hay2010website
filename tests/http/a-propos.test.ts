import { describe, expect, it } from "vitest"

import {
  assertCanonicalDocument,
  assertNotFoundDocument,
  fetchPage,
  findAnalyticsSignals,
  findConsentBanners,
  findTrackingCookies,
  isFrench,
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

/** Required sections, in the order the spec fixes for the À propos trame. */
const REQUIRED_SECTIONS = [
  "Activité et périmètre",
  "Mission, vision et valeurs",
  "Qualité, sécurité et conformité",
] as const

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

  it("renders the required sections once each, in the decided order", async () => {
    const { canonical } = await fetchOpenAPropos()
    const headings = canonical.main
      .querySelectorAll("h2")
      .map((heading) => textOf(heading))

    // spec §"Static rubriques" (À propos): identity (h1 area) → activity and
    // perimeter → mission/vision/values → qualité/sécurité/conformité block.
    let previousIndex = -1
    for (const required of REQUIRED_SECTIONS) {
      const matches = headings.reduce<number[]>(
        (indexes, heading, index) =>
          heading === required ? [...indexes, index] : indexes,
        []
      )
      expect(matches, `section « ${required} » must render exactly once`).toHaveLength(1)
      expect(matches[0], `section « ${required} » is out of order`).toBeGreaterThan(
        previousIndex
      )
      previousIndex = matches[0]
    }

    // Each section heading labels its own section landmark (accessible name).
    for (const heading of canonical.main.querySelectorAll("h2")) {
      const id = heading.getAttribute("id")
      expect(id, "every h2 must carry an id").toBeTruthy()
      expect(heading.closest("section")?.getAttribute("aria-labelledby")).toBe(id)
    }
  })

  it("states the activity and perimeter without overclaiming coverage", async () => {
    const { canonical } = await fetchOpenAPropos()
    const mainText = textOf(canonical.main)

    // The four approved launch services (facts register §2.2).
    for (const service of [
      "Éclairage public",
      "Réseaux HTA/MT",
      "MT/BT",
      "Postes de transformation",
      "CFO/CFA",
    ]) {
      expect(mainText, `the activity section must name ${service}`).toContain(service)
    }

    // Base is Rabat (facts register §2.1); national coverage is not confirmed,
    // so no page-wide coverage claim may be made.
    expect(mainText).toContain("Rabat")
    expect(
      mainText,
      "the page must not claim national coverage before the owner confirms it"
    ).not.toMatch(
      /partout au Maroc|tout le Maroc|sur tout le territoire|toutes les régions|ensemble du Royaume|couverture nationale/i
    )
  })

  it("grounds mission, vision and values in how the company works", async () => {
    const { canonical } = await fetchOpenAPropos()
    const itemTitles = canonical.main
      .querySelectorAll("h3")
      .map((heading) => textOf(heading))
    const mainText = textOf(canonical.main)

    expect(itemTitles).toEqual(
      expect.arrayContaining(["Notre mission", "Notre vision", "Nos valeurs"])
    )
    for (const value of [
      "qualité d’exécution",
      "sécurité",
      "délais",
      "conformité",
    ]) {
      expect(mainText.toLowerCase()).toContain(value)
    }
  })

  it("renders the qualité/sécurité/conformité block from cleared wording only", async () => {
    const { canonical } = await fetchOpenAPropos()
    const itemTitles = canonical.main
      .querySelectorAll("h3")
      .map((heading) => textOf(heading))

    expect(itemTitles).toEqual(
      expect.arrayContaining(["Qualité", "Sécurité", "Conformité"])
    )
  })

  it("keeps gated history, team and certification claims off the page", async () => {
    const { canonical } = await fetchOpenAPropos()
    const mainText = textOf(canonical.main)

    // Facts register §3: no founding year and no "depuis 20xx" claim while the
    // register keeps them gated.
    expect(mainText).not.toMatch(
      /depuis\s+(?:2004|2011)|créée?\s+en\s+\d{4}|fondée?\s+en\s+\d{4}|plus de 20 ans|20 ans d’expérience|date de création/i
    )

    // No certification or agrément claim: the canonical block lives in
    // Références et partenaires (P2) and both ONEE certificates are missing.
    expect(mainText).not.toMatch(
      /agrément|ONEE|ISO\s?\d|norme ISO|certifi|entreprise agréée|homologu|qualification/i
    )

    // Gated activity domains (IA §Domaines d'activité) stay off the page.
    expect(mainText).not.toMatch(/solaire|photovolta|énergies? renouvelables/i)

    // Team material is gated: no org chart, quote or biography section.
    const itemHeadings = canonical.main
      .querySelectorAll("h2, h3")
      .map((heading) => textOf(heading))
    expect(
      itemHeadings.filter((heading) =>
        /équipe|collaborat|organigramme|mot du gérant|biographie|parcours/i.test(
          heading
        )
      )
    ).toEqual([])
    expect(
      canonical.main.querySelectorAll("blockquote"),
      "no testimonial or quote block may render"
    ).toHaveLength(0)
  })

  it("renders no employee name or photograph while they stay gated", async () => {
    const { canonical } = await fetchOpenAPropos()
    const main = canonical.main

    expect(
      main.querySelectorAll("img, picture, figure, video, iframe"),
      "no photograph or media element may render"
    ).toHaveLength(0)
    expect(main.querySelectorAll('[role="img"]')).toHaveLength(0)

    const mainText = textOf(main)
    // The cleared gérant line is the only person named on the page.
    expect(mainText.match(/Rahhal Essamlali/g) ?? []).toHaveLength(1)
    expect(mainText).not.toMatch(/\bMonsieur\b|\bMadame\b|\bMme\b|\bM\.\s/)
  })

  it("links to no unpublished certifications page and no gated route", async () => {
    const { canonical } = await fetchOpenAPropos()
    const hrefs = canonical.main
      .querySelectorAll("a[href]")
      .map((anchor) => anchor.getAttribute("href") ?? "")

    // Références et partenaires is P2. The compliance block's extension point
    // (see app/(frontend)/a-propos/page.tsx) renders the canonical link only
    // once that rubrique is published AND its page document exists; at P1 it
    // must render nothing, so no link and no reference to the page.
    expect(hrefs).not.toContain("/references-et-partenaires")
    expect(
      hrefs.filter((href) => scenario.gatedRoutes.includes(href)),
      "no gated route may be linked"
    ).toEqual([])
    expect(textOf(canonical.main)).not.toMatch(/références et partenaires/i)

    // The only outbound page link is the published contact page (CTA).
    expect(hrefs).toContain("/contact")
  })

  it("has unique metadata on the published route set, within SEO bounds", async () => {
    const { page } = await fetchOpenAPropos()
    const { title, description } = assertCanonicalDocument(page)

    // Unique title and description against every other published page of this
    // scenario, not just against the homepage.
    for (const route of scenario.openRoutes) {
      if (route === A_PROPOS) continue
      const other = await fetchPage(route)
      expect(other.status, `${route} must be served in this scenario`).toBe(200)
      const canonical = assertCanonicalDocument(other)
      expect(canonical.title, `title of ${route} collides with À propos`).not.toBe(
        title
      )
      expect(
        canonical.description,
        `description of ${route} collides with À propos`
      ).not.toBe(description)
    }

    expect(title).toContain("HAY2010")
    expect(title.length).toBeLessThanOrEqual(65)
    expect(isFrench(title), `title is not French: ${title}`).toBe(true)

    expect(description.length).toBeGreaterThanOrEqual(120)
    expect(description.length).toBeLessThanOrEqual(170)
    expect(
      isFrench(description),
      `description is not French: ${description}`
    ).toBe(true)
    expect(description).not.toMatch(
      /agrément|ONEE|certifi|depuis (?:2004|2011)|leader|n°1/i
    )
  })

  it("stays free of forms, analytics, consent banners and tracking cookies", async () => {
    const { page } = await fetchOpenAPropos()

    for (const selector of ["form", "input", "textarea", "select"]) {
      expect(
        page.document.querySelectorAll(selector),
        `unexpected <${selector}>`
      ).toHaveLength(0)
    }
    expect(findAnalyticsSignals(page)).toEqual([])
    expect(findConsentBanners(page)).toEqual([])
    expect(findTrackingCookies(page.headers)).toEqual([])
  })

  it("renders no placeholder or coming-soon copy", async () => {
    const { canonical } = await fetchOpenAPropos()
    expect(textOf(canonical.main)).not.toMatch(
      /lorem ipsum|à venir|coming soon|bientôt disponible|placeholder|TODO/i
    )
  })

})

describe.runIf(A_PROPOS_GATED)(`À propos gate (${scenario.name})`, () => {
  it("returns the branded 404 while the rubrique is closed", async () => {
    assertNotFoundDocument(await fetchPage(A_PROPOS))
  })
})
