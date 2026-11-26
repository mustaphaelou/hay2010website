import type { HTMLElement } from "node-html-parser"
import { describe, expect, it } from "vitest"

import {
  assertCanonicalDocument,
  elementChildren,
  fetchPage,
  fetchStylesheets,
  findAnalyticsSignals,
  findConsentBanners,
  isFrench,
  textOf,
} from "./helpers"
import { scenario } from "./scenarios"
import { linksIn } from "./surfaces"

/**
 * Accueil over HTTP — ticket #23 acceptance:
 * - the seven CDC sections render once each, in the decided order:
 *   hero → intro → domain blocks → repères → réalisations teaser →
 *   engagements → contact CTA;
 * - the hero renders the licensed documentary image when the content carries
 *   one and the typographic ink fallback otherwise, with explicit dimensions
 *   and no stock/placeholder media;
 * - the domain blocks link only the published domain pages of the scenario;
 * - the repères band carries only facts the register clears — no invented
 *   counts, no statistics strip, no ONEE wording;
 * - the réalisations teaser keeps the `Références sur demande` fallback and
 *   links /realisations without project cards;
 * - the engagements block is text-only (qualité, sécurité, délais);
 * - no careers teaser and no news teaser exist;
 * - the contact CTA closes the page and links the published contact route;
 * - hero motion is guarded by `prefers-reduced-motion`;
 * - the metadata is unique, French, and within the SEO bounds.
 *
 * The expected wording comes from the decided documents
 * (docs/homepage/README.md §3.4, docs/seo/seo-metadata.md §3.3/§8.3,
 * docs/company/facts-register.md §2.2), not from the fixture corpus under test.
 */

const HOMEPAGE = "/"

/** SEO §8.3: the homepage H1 is the query phrase, not the poetic line. */
const HERO_HEADLINE = "Éclairage public et électrification à Rabat"

/** SEO §3.3: the homepage uses `title.absolute`, brand first (≤65 chars). */
const HOMEPAGE_TITLE = "HAY2010 — Éclairage public et électrification à Rabat"

/** Approved facts only (facts register §2.2). */
const APPROVED_EXPERIENCE_LINE = "Plus de 10 ans d’expérience"
const APPROVED_BASE = "Rabat — Maroc"
const APPROVED_SERVICE_WORDS = [
  "Éclairage public",
  "Réseaux HTA/MT",
  "MT/BT",
  "Postes de transformation",
  "CFO/CFA",
] as const

/** Non-hero section headings of the CDC trame, in order (spec §Homepage). */
const TRAME_HEADINGS = [
  "Qui sommes-nous",
  "Nos domaines d’activité",
  "Repères",
  "Réalisations",
  "Nos engagements",
] as const

/** Full CDC titles of the five canonical domains (IA §Domaines d’activité). */
const DOMAIN_TITLES: Readonly<Record<string, string>> = {
  "eclairage-public": "Éclairage public",
  "installations-electriques": "Installations électriques",
  "infrastructures-reseaux-electriques":
    "Infrastructures et réseaux électriques",
  "energies-renouvelables": "Énergies renouvelables et solaire",
  "fourniture-equipements": "Fourniture d’équipements et de matériel",
}

/** Top-level sections of `<main>`, in document order (the trame is flat). */
function sectionsOf(main: HTMLElement): HTMLElement[] {
  return elementChildren(main).filter(
    (element) => element.tagName === "SECTION"
  )
}

function heroOf(main: HTMLElement): HTMLElement {
  const hero = sectionsOf(main)[0]
  if (!hero) throw new Error("the homepage must open with its hero section")
  return hero
}

function sectionByHeading(main: HTMLElement, heading: string): HTMLElement {
  const section = sectionsOf(main).find((candidate) => {
    const h2 = candidate.querySelector("h2")
    return h2 !== null && textOf(h2) === heading
  })
  if (!section)
    throw new Error(`the homepage must render the « ${heading} » section`)
  return section
}

function domainLinksIn(section: HTMLElement): string[] {
  return section
    .querySelectorAll("a[href]")
    .map((anchor) => anchor.getAttribute("href") ?? "")
    .filter((href) => href.startsWith("/domaines-activite/"))
}

async function fetchHomepage() {
  const page = await fetchPage(HOMEPAGE)
  expect(
    page.status,
    `the homepage must be served in scenario "${scenario.name}"`
  ).toBe(200)
  const canonical = assertCanonicalDocument(page)
  return { page, canonical, main: canonical.main }
}

describe(`accueil — composition (${scenario.name})`, () => {
  it("serves a French homepage with exactly one h1 outside the shell", async () => {
    const { canonical } = await fetchHomepage()

    expect(canonical.html.getAttribute("lang")).toBe("fr")
    expect(canonical.main.querySelectorAll("h1")).toHaveLength(1)

    const h1 = canonical.main.querySelector("h1")
    if (!h1) throw new Error("the homepage must carry an h1")
    expect(textOf(h1)).toBe(HERO_HEADLINE)
    // SEO §8.3: the H1 carries the query — éclairage public and Rabat.
    expect(textOf(h1)).toMatch(/éclairage public/i)
    expect(textOf(h1)).toMatch(/Rabat/)
  })

  it("renders the CDC sections once each, in the decided order", async () => {
    const { main } = await fetchHomepage()
    const sections = sectionsOf(main)

    // hero + six trames: intro, domaines, repères, réalisations, engagements,
    // contact CTA. Nothing else may be a top-level section of the page.
    expect(sections, "the homepage trame is seven sections").toHaveLength(7)

    const hero = sections[0]
    expect(hero.querySelector("h1"), "the hero opens the page").not.toBeNull()

    const headings = sections.slice(1).map((section) => {
      const h2 = section.querySelector("h2")
      expect(h2, "every trame section must be labelled by an h2").not.toBeNull()
      return textOf(h2 as NonNullable<typeof h2>)
    })
    expect(headings.slice(0, TRAME_HEADINGS.length)).toEqual([
      ...TRAME_HEADINGS,
    ])
    // The last section is the contact CTA, phrased as the decided question.
    expect(headings[5]).toMatch(
      /^Un projet d’éclairage public ou d’électrification\s*\?$/
    )

    // Accessible names: every section points at its own heading.
    for (const section of sections) {
      const labelledBy = section.getAttribute("aria-labelledby")
      expect(labelledBy, "a section must reference its heading").toBeTruthy()
      expect(
        section.querySelector(`#${labelledBy}`),
        `section aria-labelledby="${labelledBy}" must resolve inside the section`
      ).not.toBeNull()
    }
  })

  it("links the À propos page from the intro only while it is published", async () => {
    const { main } = await fetchHomepage()
    const intro = sectionByHeading(main, "Qui sommes-nous")
    const hrefs = linksIn(intro).map((link) => link.href)

    if (scenario.gatedRoutes.includes("/a-propos")) {
      expect(hrefs, "a closed À propos gate must not be linked").not.toContain(
        "/a-propos"
      )
    } else {
      expect(
        hrefs,
        "the intro must link the published À propos page"
      ).toContain("/a-propos")
    }
    // The intro is a short company statement, not a second hero.
    expect(textOf(intro).length).toBeGreaterThan(120)
    expect(textOf(intro).length).toBeLessThan(700)
  })
})

describe(`accueil — hero (${scenario.name})`, () => {
  it("answers the content state the scenario declares", async () => {
    const { main } = await fetchHomepage()
    const images = heroOf(main).querySelectorAll("img")
    expect(images.length, `the hero image state of ${scenario.name}`).toBe(
      scenario.heroImage ? 1 : 0
    )
  })

  it("renders the typographic ink fallback when no licensed image exists", async () => {
    if (scenario.heroImage) return

    const { main } = await fetchHomepage()
    const hero = heroOf(main)

    // No photograph, no generated scene, no placeholder frame — the fallback
    // is type on ink (brand direction §2.5).
    for (const selector of [
      "img",
      "picture",
      "video",
      "iframe",
      "figure",
      "svg[role='img']",
    ]) {
      expect(
        hero.querySelectorAll(selector),
        `the fallback must not render ${selector}`
      ).toHaveLength(0)
    }

    const text = textOf(hero)
    expect(text).toContain("Éclairage public et électrification à Rabat")
    // Approved positioning line as the hero subline (facts register §5.3).
    expect(text).toContain(
      "Depuis plus de 10 ans, HAY2010 accompagne les collectivités et les entreprises dans leurs projets d’éclairage public et d’électrification."
    )
    expect(text).not.toMatch(
      /visuel provisoire|placeholder|image de|lorem ipsum/i
    )

    // The decided CTAs: Réalisations and Contact (spec §Homepage composition).
    const hrefs = linksIn(hero).map((link) => link.href)
    expect(hrefs).toContain("/realisations")
    expect(hrefs).toContain("/contact")
  })

  it("renders the supplied licensed image with explicit dimensions and no layout shift", async () => {
    if (!scenario.heroImage) return

    const { main } = await fetchHomepage()
    const hero = heroOf(main)
    const images = hero.querySelectorAll("img")
    expect(
      images,
      "the hero must render the supplied documentary image"
    ).toHaveLength(1)

    const image = images[0]
    expect(
      image.getAttribute("alt") ?? "",
      "the hero image needs French alt text"
    ).not.toBe("")
    expect(
      isFrench(image.getAttribute("alt") ?? ""),
      "the hero alt text must be French"
    ).toBe(true)

    // Explicit intrinsic dimensions reserve the aspect ratio: no layout shift.
    const width = Number(image.getAttribute("width"))
    const height = Number(image.getAttribute("height"))
    expect(
      width,
      "the hero image must carry its intrinsic width"
    ).toBeGreaterThan(0)
    expect(
      height,
      "the hero image must carry its intrinsic height"
    ).toBeGreaterThan(0)

    // Never a stock or external host: the media comes from the content source
    // (brand direction §2.5/§4).
    const sources = [
      image.getAttribute("src") ?? "",
      image.getAttribute("srcset") ?? "",
    ].join(" ")
    expect(sources).not.toBe("")
    expect(
      sources,
      "the hero image must not be a remote stock image"
    ).not.toMatch(/https?:\/\//i)

    // The headline and the subline stay over the photograph.
    expect(textOf(hero)).toContain(HERO_HEADLINE)
    expect(textOf(hero)).toContain("Depuis plus de 10 ans")
  })
})

describe(`accueil — domain blocks (${scenario.name})`, () => {
  it("links exactly the published domain pages, in CDC order", async () => {
    const { main } = await fetchHomepage()
    const section = sectionByHeading(main, "Nos domaines d’activité")

    expect(
      domainLinksIn(section),
      `the homepage must link the published domains of ${scenario.name}`
    ).toEqual(
      scenario.publishedDomains.map((slug) => `/domaines-activite/${slug}`)
    )

    const text = textOf(section)
    for (const slug of scenario.publishedDomains) {
      expect(text, `the domain block must name ${slug}`).toContain(
        DOMAIN_TITLES[slug]
      )
    }
  })

  it("keeps gated domains out of the blocks", async () => {
    const { main } = await fetchHomepage()
    const section = sectionByHeading(main, "Nos domaines d’activité")
    const hrefs = domainLinksIn(section)
    const text = textOf(section)

    for (const slug of scenario.gatedDomains) {
      expect(
        hrefs,
        `a gated domain must not be linked (${slug})`
      ).not.toContain(`/domaines-activite/${slug}`)
      expect(
        text,
        `a gated domain title must not appear (${slug})`
      ).not.toContain(DOMAIN_TITLES[slug])
    }

    // Internal links inside the block go to domain pages only: never to a
    // page outside the published domain set.
    expect(
      linksIn(section)
        .map((link) => link.href)
        .filter((href) => !href.startsWith("/domaines-activite/")),
      "the domain block may only link domain pages"
    ).toEqual([])
  })
})

describe(`accueil — repères (${scenario.name})`, () => {
  it("renders only the cleared facts and the four approved service words", async () => {
    const { main } = await fetchHomepage()
    const section = sectionByHeading(main, "Repères")
    const text = textOf(section)

    expect(text).toContain(APPROVED_EXPERIENCE_LINE)
    expect(text).toContain(APPROVED_BASE)
    for (const service of APPROVED_SERVICE_WORDS) {
      expect(text, `the repères band must carry « ${service} »`).toContain(
        service
      )
    }
  })

  it("prints no invented figures, no statistics strip and no gated claim", async () => {
    const { main } = await fetchHomepage()
    const mainText = textOf(main)

    // No invented counts of projects, clients, staff, markets or references.
    expect(mainText).not.toMatch(
      /\b\d+\s+(?:marchés?|projets?|clients?|chantiers?|salariés?|collaborateurs?|références?|agences?|villes?)\b/i
    )
    expect(mainText, "no invented percentage").not.toMatch(/\d+\s*%/)
    expect(mainText, "no financial figures").not.toMatch(
      /\b(?:MAD|DH|dirhams?|millions?|milliard)\b/i
    )
    expect(mainText, "no ranking or certification claim").not.toMatch(
      /\b(?:n°\s*1|leader|meilleur|certifié|ISO\s?\d+|entreprise agréée|ONEE|agrément)\b/i
    )
    expect(mainText, "no founding year or overstated experience").not.toMatch(
      /depuis\s+(?:2004|2011)|créée?\s+en\s+\d{4}|fondée?\s+en\s+\d{4}|plus de 20 ans/i
    )
    // The 2026-11-09 verification found no attributable award: nothing from
    // the procurement record may appear (facts register §3).
    expect(mainText).not.toMatch(
      /Khemisset|78[.,]?\s?66|187\s?607|14\s+marchés/i
    )

    // A facts band, not a statistics strip built to look like three figures.
    expect(textOf(sectionByHeading(main, "Repères")).length).toBeLessThan(700)
  })
})

describe(`accueil — réalisations teaser and engagements (${scenario.name})`, () => {
  it("keeps the Références sur demande fallback and links /realisations", async () => {
    const { main } = await fetchHomepage()
    const section = sectionByHeading(main, "Réalisations")
    const text = textOf(section)

    expect(text).toContain("Références sur demande")
    expect(text).toContain(
      "Nos références sont transmises sur demande, après accord des maîtres d’ouvrage."
    )

    // Fewer than three approved case studies exist: no project cards, no
    // detail links, no photography (realisations-strategy.md §3).
    expect(
      section.querySelectorAll("article, figure, img, picture, video"),
      "the teaser must not render project cards or project photography"
    ).toHaveLength(0)

    const hrefs = linksIn(section).map((link) => link.href)
    expect(hrefs).toContain("/realisations")
    expect(
      hrefs.filter((href) => href.startsWith("/realisations/")),
      "gated case-study routes must never be linked"
    ).toEqual([])
  })

  it("renders text-only engagements (qualité, sécurité, délais) without claims", async () => {
    const { main } = await fetchHomepage()
    const section = sectionByHeading(main, "Nos engagements")

    expect(
      section.querySelectorAll("h3").map((heading) => textOf(heading))
    ).toEqual(["Qualité", "Sécurité", "Délais"])

    expect(
      section.querySelectorAll("img, picture, figure, video, iframe"),
      "the engagements block is text-only"
    ).toHaveLength(0)

    const text = textOf(section)
    expect(text).not.toMatch(
      /ISO\s?\d|norme ISO|certifi|agrément|ONEE|entreprise agréée/i
    )
    // No equipment or fleet claim: only the working commitments.
    expect(text).not.toMatch(
      /\b(?:nacelle|grue|camion|flotte|parc matériel|matériel|outillage)\b/i
    )
  })
})

describe(`accueil — excluded teasers and contact CTA (${scenario.name})`, () => {
  it("renders no careers teaser and no news teaser", async () => {
    const { main } = await fetchHomepage()
    const mainText = textOf(main)
    const hrefs = linksIn(main).map((link) => link.href)

    expect(mainText).not.toMatch(
      /carrières|recrutement|actualités|newsletter|derniers articles|\bblog\b/i
    )
    expect(hrefs).not.toContain("/carrieres")
    expect(
      hrefs.filter(
        (href) => href === "/actualites" || href.startsWith("/actualites/")
      ),
      "no news teaser may link Actualités"
    ).toEqual([])

    // No selected-project cards, no video band: this is an institutional page.
    expect(
      main.querySelectorAll("article, video, iframe"),
      "no cards or video band on the homepage"
    ).toHaveLength(0)
  })

  it("closes on the orange contact CTA linking the published contact page", async () => {
    const { main } = await fetchHomepage()
    const sections = sectionsOf(main)
    const cta = sections[sections.length - 1]

    const heading = cta.querySelector("h2")
    if (!heading) throw new Error("the contact CTA must carry an h2")
    expect(textOf(heading)).toMatch(/\?$/)
    expect(textOf(heading)).toMatch(
      /projet d’éclairage public|électrification/i
    )

    const links = linksIn(cta)
    expect(links.map((link) => link.href)).toEqual(["/contact"])
    expect(links[0].label.length, "the CTA link needs a label").toBeGreaterThan(
      0
    )
  })
})

describe(`accueil — motion and metadata (${scenario.name})`, () => {
  it("guards hero motion behind prefers-reduced-motion", async () => {
    const page = await fetchPage(HOMEPAGE)
    const css = (await fetchStylesheets(page))
      .map((stylesheet) => stylesheet.text)
      .join("\n")

    // Motion is opt-in: the animation is declared in a no-preference query and
    // switched off for visitors who ask for reduced motion (brand §2.7).
    expect(css, "hero motion must be guarded by no-preference").toMatch(
      /@media\s*\(prefers-reduced-motion:\s*no-preference\)/
    )
    expect(css, "the guarded motion must be a CSS animation").toMatch(
      /@keyframes\s+[\w-]+/
    )
    expect(css, "reduced motion must disable the animation").toMatch(
      /animation:\s*none/
    )
  })

  it("has a unique title and description within the SEO bounds", async () => {
    const page = await fetchPage(HOMEPAGE)
    const { title, description } = assertCanonicalDocument(page)

    expect(title).toBe(HOMEPAGE_TITLE)
    expect(title.length).toBeLessThanOrEqual(65)
    expect(isFrench(title), `title is not French: ${title}`).toBe(true)

    expect(description.length).toBeGreaterThanOrEqual(120)
    expect(description.length).toBeLessThanOrEqual(160)
    expect(
      isFrench(description),
      `description is not French: ${description}`
    ).toBe(true)
    expect(description).toMatch(/éclairage public/i)
    expect(description).not.toMatch(
      /agrément|ONEE|certifi|depuis (?:2004|2011)|leader|n°1/i
    )

    // The homepage canonical is the apex origin without a trailing slash.
    const canonicals = page.document.querySelectorAll('link[rel="canonical"]')
    expect(canonicals).toHaveLength(1)
    expect(canonicals[0].getAttribute("href")).toBe("https://hay2010.ma")

    // Unique metadata against every other published page of this scenario.
    for (const route of scenario.openRoutes) {
      if (route === HOMEPAGE) continue
      const other = await fetchPage(route)
      expect(other.status, `${route} must be served in this scenario`).toBe(200)
      const document = assertCanonicalDocument(other)
      expect(
        document.title,
        `title of ${route} collides with the homepage`
      ).not.toBe(title)
      expect(
        document.description,
        `description of ${route} collides with the homepage`
      ).not.toBe(description)
    }
  })

  it("stays free of forms, analytics and consent surfaces", async () => {
    const page = await fetchPage(HOMEPAGE)
    for (const selector of ["form", "input", "textarea", "select"]) {
      expect(
        page.document.querySelectorAll(selector),
        `unexpected <${selector}>`
      ).toHaveLength(0)
    }
    expect(findAnalyticsSignals(page)).toEqual([])
    expect(findConsentBanners(page)).toEqual([])
    expect(
      textOf(page.document.querySelector("main") as HTMLElement)
    ).not.toMatch(
      /lorem ipsum|à venir|coming soon|bientôt disponible|placeholder|TODO/i
    )
  })
})
