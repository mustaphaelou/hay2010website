import type { HTMLElement } from "node-html-parser"
import { describe, expect, it } from "vitest"

import {
  assertCanonicalDocument,
  fetchPage,
  fetchSitemapPaths,
  isFrench,
  SITEMAP_ORIGIN,
  textOf,
} from "./helpers"
import { scenario } from "./scenarios"
import { internalHrefs, linksIn } from "./surfaces"

/**
 * Domaine d'activité pages over HTTP — ticket #22 acceptance.
 *
 * The expected public shape is derived from the decided documents, never from
 * the code under test:
 * - docs/content/information-architecture.md §Domaines d'activité (three P1
 *   domains, two gated, CFO/CFA and postes de transformation are prestations);
 * - docs/spec/p1-website-build.md §"Domaines d'activité and prestations" (the
 *   CDC trame order and the DEV-006 absence rule);
 * - docs/company/facts-register.md §2.2 (no ONEE wording while the certificate
 *   gate is closed) and §3 (no Solaire, no gated claim);
 * - docs/build/content-seam.md §3 (content comes from the seam; a closed gate
 *   is absent, never a placeholder).
 *
 * The suite runs once per fixture scenario, so the same assertions observe the
 * launch state (three domains, two gated) and the closed-gate regression
 * (Éclairage public withheld).
 */

const DOMAINES_INDEX = "/domaines-activite"

/** Canonical route of a domain page. */
function domainPath(slug: string): string {
  return `${DOMAINES_INDEX}/${slug}`
}

/** Full CDC titles of the five canonical domains (IA §Domaines d'activité). */
const DOMAIN_TITLES: Readonly<Record<string, string>> = {
  "eclairage-public": "Éclairage public",
  "installations-electriques": "Installations électriques",
  "infrastructures-reseaux-electriques": "Infrastructures et réseaux électriques",
  "energies-renouvelables": "Énergies renouvelables et solaire",
  "fourniture-equipements": "Fourniture d’équipements et de matériel",
}

/** The two domains gated by the P1 tier (DEV-005): never published at launch. */
const TIER_GATED_DOMAINS = [
  "energies-renouvelables",
  "fourniture-equipements",
] as const

/** Links under `<main>` that point at a domain child page. */
function domainLinksIn(main: HTMLElement): string[] {
  return main
    .querySelectorAll("a[href]")
    .map((anchor) => anchor.getAttribute("href") ?? "")
    .filter((href) => href.startsWith(`${DOMAINES_INDEX}/`))
}

describe(`domaines d’activité — index (${scenario.name})`, () => {
  it("serves the index as a canonical French document with its own h1", async () => {
    const page = await fetchPage(DOMAINES_INDEX)
    expect(page.status, "the domain index must be published").toBe(200)

    const canonical = assertCanonicalDocument(page)
    expect(canonical.html.getAttribute("lang")).toBe("fr")

    const h1 = canonical.main.querySelector("h1")
    expect(h1, "the index must carry one h1").not.toBeNull()
    if (!h1) throw new Error("missing index h1")
    expect(textOf(h1)).toBe("Nos domaines d’activité")
  })

  it("lists exactly the published domains, in CDC order, and links each page", async () => {
    const page = await fetchPage(DOMAINES_INDEX)
    const { main } = assertCanonicalDocument(page)

    expect(
      domainLinksIn(main),
      `the index must link exactly the published domains of ${scenario.name}`
    ).toEqual(scenario.publishedDomains.map(domainPath))

    const mainText = textOf(main)
    for (const slug of scenario.publishedDomains) {
      expect(
        mainText,
        `the index must name the published domain ${slug}`
      ).toContain(DOMAIN_TITLES[slug])
    }
  })

  it("keeps the tier-gated domains off the index while their gate is closed", async () => {
    const page = await fetchPage(DOMAINES_INDEX)
    const { main } = assertCanonicalDocument(page)
    const hrefs = internalHrefs(page)
    const mainText = textOf(main)

    for (const slug of TIER_GATED_DOMAINS) {
      if (scenario.publishedDomains.includes(slug)) continue
      expect(
        hrefs,
        `a gated domain must not be linked from the index (${slug})`
      ).not.toContain(domainPath(slug))
      expect(
        mainText,
        `a gated domain title must not appear on the index (${slug})`
      ).not.toContain(DOMAIN_TITLES[slug])
    }

    // CFO/CFA and postes de transformation are prestations, not domains: they
    // never appear in the index domain list.
    const listTitles = linksIn(main).map((link) => link.label)
    expect(listTitles).not.toContain("CFO/CFA")
    expect(listTitles).not.toContain("Postes de transformation")
  })
})

/** The three P1 domains carrying the CDC trame (IA §Domaines d'activité). */
const P1_CONTENT_DOMAINS = [
  "eclairage-public",
  "installations-electriques",
  "infrastructures-reseaux-electriques",
] as const

/** Section headings of the fixed CDC trame, in order (spec §Domaines). */
const TRAME_HEADINGS = [
  "Présentation et besoins",
  "Prestations confirmées",
  "Méthode, moyens et compétences",
] as const

/** Content domains published in the active scenario. */
function publishedContentDomains(): string[] {
  return P1_CONTENT_DOMAINS.filter((slug) => scenario.publishedDomains.includes(slug))
}

/** Section elements of `<main>`, in document order. */
function sectionsOf(main: HTMLElement): HTMLElement[] {
  return main.querySelectorAll("section")
}

/** Collapsed text of every `h2`/`h3` under an element. */
function headingsOf(element: HTMLElement, selector: "h2" | "h3"): string[] {
  return element.querySelectorAll(selector).map((heading) => textOf(heading))
}

describe(`domaine pages — CDC trame (${scenario.name})`, () => {
  it("serves each published content domain as a canonical document with its title as h1", async () => {
    for (const slug of publishedContentDomains()) {
      const page = await fetchPage(domainPath(slug))
      expect(page.status, `published domain ${slug} must be served`).toBe(200)

      const canonical = assertCanonicalDocument(page)
      const h1 = canonical.main.querySelector("h1")
      expect(h1, `${slug} must carry one h1`).not.toBeNull()
      if (!h1) throw new Error(`missing h1 on ${slug}`)
      expect(textOf(h1)).toBe(DOMAIN_TITLES[slug])
    }
  })

  it("renders the trame sections in the CDC order", async () => {
    for (const slug of publishedContentDomains()) {
      const page = await fetchPage(domainPath(slug))
      const { main } = assertCanonicalDocument(page)

      const headings = headingsOf(main, "h2")
      expect(headings, `${slug} must render exactly the CDC trame`).toHaveLength(4)
      expect(headings.slice(0, TRAME_HEADINGS.length), `${slug} trame order`).toEqual([
        ...TRAME_HEADINGS,
      ])
      // The last trame section is the contact CTA, phrased as a question.
      expect(headings[3], `${slug} contact CTA must be phrased as a question`).toMatch(
        /projet|installation|réseau/i
      )
      expect(headings[3], `${slug} contact CTA must end with a question mark`).toMatch(
        /\?$/
      )
    }
  })

  it("renders presentation and needs, confirmed prestations and methods from content", async () => {
    for (const slug of publishedContentDomains()) {
      const page = await fetchPage(domainPath(slug))
      const { main } = assertCanonicalDocument(page)
      const sections = sectionsOf(main)
      expect(sections, `${slug} must render one section per trame block`).toHaveLength(4)

      const [presentation, prestations, methods, contact] = sections

      // 1. Presentation and needs: prose, not a placeholder.
      const presentationParagraphs = presentation.querySelectorAll("p")
      expect(
        presentationParagraphs.length,
        `${slug} presentation must carry its prose`
      ).toBeGreaterThanOrEqual(2)
      expect(
        textOf(presentation).length,
        `${slug} presentation must be substantive`
      ).toBeGreaterThan(250)

      // 2. Confirmed prestations: named items, each with a description.
      const prestationItems = prestations.querySelectorAll("li")
      expect(
        prestationItems.length,
        `${slug} must list its confirmed prestations`
      ).toBeGreaterThanOrEqual(3)
      const prestationNames = headingsOf(prestations, "h3")
      expect(prestationNames).toHaveLength(prestationItems.length)
      for (const name of prestationNames) {
        expect(name, `${slug} prestation names must be French`).not.toBe("")
      }
      prestationItems.forEach((item, index) => {
        expect(
          textOf(item).length,
          `${slug} every prestation must carry its own description`
        ).toBeGreaterThan(prestationNames[index].length)
      })

      // 3. Methods, means and competences: titled items, not one blob.
      expect(
        headingsOf(methods, "h3").length,
        `${slug} must detail its methods, means and competences`
      ).toBeGreaterThanOrEqual(3)

      // 4. Contact CTA: the cleared contact route, once.
      const ctaLinks = contact.querySelectorAll('a[href="/contact"]')
      expect(ctaLinks, `${slug} must close on the contact CTA`).toHaveLength(1)
      expect(textOf(ctaLinks[0]).length).toBeGreaterThan(0)
    }
  })

  it("keeps CFO/CFA and postes de transformation inside their domain", async () => {
    const installations = await fetchPage(domainPath("installations-electriques"))
    if (scenario.publishedDomains.includes("installations-electriques")) {
      expect(installations.status).toBe(200)
      const text = textOf(installations.document.querySelector("main") as HTMLElement)
      expect(text, "CFO/CFA is a prestation of the installations domain").toContain(
        "CFO/CFA"
      )
    }

    const infrastructures = await fetchPage(domainPath("infrastructures-reseaux-electriques"))
    if (scenario.publishedDomains.includes("infrastructures-reseaux-electriques")) {
      expect(infrastructures.status).toBe(200)
      const text = textOf(
        infrastructures.document.querySelector("main") as HTMLElement
      )
      expect(
        text,
        "postes de transformation is a prestation of the networks domain"
      ).toMatch(/postes de transformation/i)
    }
  })

  it("omits the photo and associated-réalisations blocks instead of faking them", async () => {
    for (const slug of publishedContentDomains()) {
      const page = await fetchPage(domainPath(slug))
      const { main } = assertCanonicalDocument(page)

      // DEV-006: no photo block and no associated-réalisations block at P1.
      for (const selector of ["img", "figure", "picture"]) {
        expect(
          main.querySelectorAll(selector),
          `${slug} must not render a ${selector} block (DEV-006)`
        ).toHaveLength(0)
      }

      const headings = [...headingsOf(main, "h2"), ...headingsOf(main, "h3")]
      expect(
        headings.filter((heading) =>
          /photos?|réalisations associées|galerie/i.test(heading)
        ),
        `${slug} must not render a photo or associated-réalisations heading`
      ).toEqual([])

      expect(
        textOf(main),
        `${slug} must not fill the omitted blocks with placeholder copy`
      ).not.toMatch(/bientôt|à venir|prochainement|lorem ipsum|placeholder|en construction/i)
    }
  })
})

describe(`domaines d’activité — gates, claims and metadata (${scenario.name})`, () => {
  it("gives the index and each published domain page a unique title, description and canonical URL", async () => {
    const paths = [
      DOMAINES_INDEX,
      ...publishedContentDomains().map(domainPath),
    ]
    const titles: string[] = []
    const descriptions: string[] = []
    const canonicals: string[] = []

    for (const path of paths) {
      const page = await fetchPage(path)
      expect(page.status, `${path} must be served`).toBe(200)
      const document = assertCanonicalDocument(page)

      // One canonical, absolute, on the apex origin, without a trailing slash.
      const canonicalLinks = page.document.querySelectorAll('link[rel="canonical"]')
      expect(canonicalLinks, `${path} must carry exactly one canonical`).toHaveLength(1)
      const href = canonicalLinks[0].getAttribute("href") ?? ""
      expect(href, `${path} canonical must be the apex URL`).toBe(
        `${SITEMAP_ORIGIN}${path}`
      )
      expect(href.endsWith("/"), `${path} canonical must not end with a slash`).toBe(
        false
      )

      // One HAY2010 suffix, French, within the SEO title bound (#32 completes).
      expect(document.title, `${path} title must carry the brand`).toContain("HAY2010")
      expect(document.title.length, `${path} title length`).toBeLessThanOrEqual(65)
      expect(isFrench(document.title), `${path} title must be French`).toBe(true)

      // Description: unique, French, within the SEO length bounds.
      expect(document.description.length, `${path} description length`).toBeGreaterThanOrEqual(
        100
      )
      expect(
        document.description.length,
        `${path} description length`
      ).toBeLessThanOrEqual(170)
      expect(isFrench(document.description), `${path} description must be French`).toBe(
        true
      )

      titles.push(document.title)
      descriptions.push(document.description)
      canonicals.push(href)
    }

    expect(new Set(titles).size, "titles must be unique per page").toBe(paths.length)
    expect(
      new Set(descriptions).size,
      "descriptions must be unique per page"
    ).toBe(paths.length)
    expect(new Set(canonicals).size, "canonicals must be unique per page").toBe(
      paths.length
    )
  })

  it("prints no ONEE agrément wording on any published page while the certificate gate is closed", async () => {
    // The fact is approved but gated: it may appear only once both ONEE
    // certificates are filed (facts register §2.2/§8, seo doc §3.3). This walks
    // the whole published route matrix so a later page ticket cannot leak it.
    for (const route of scenario.openRoutes) {
      const page = await fetchPage(route)
      expect(page.status, `${route} must be served`).toBe(200)
      const { main } = assertCanonicalDocument(page)

      expect(
        textOf(main),
        `${route} must not print the gated ONEE agrément claim`
      ).not.toMatch(/ONEE|agrément|entreprise agréée/i)
    }
  })

  it("keeps gated domains out of the sitemap and the published ones in it", async () => {
    const paths = await fetchSitemapPaths()

    // Every published content domain page is listed…
    for (const slug of publishedContentDomains()) {
      expect(paths, `${slug} belongs in the sitemap`).toContain(domainPath(slug))
    }
    // …the index too…
    expect(paths, "the domain index belongs in the sitemap").toContain(DOMAINES_INDEX)

    // …and a domain whose gate is closed is never listed.
    for (const slug of TIER_GATED_DOMAINS) {
      if (scenario.publishedDomains.includes(slug)) continue
      expect(paths, `gated domain ${slug} must stay out of the sitemap`).not.toContain(
        domainPath(slug)
      )
    }
  })

  it("keeps the gated claims vocabulary out of the published domain pages", async () => {
    // The tier-gated domains are a P2 simulation in p2/p3; the vocabulary is
    // gated only while those domains are actually withheld (DEV-005).
    const tierGatesClosed = TIER_GATED_DOMAINS.every(
      (slug) => !scenario.publishedDomains.includes(slug)
    )
    if (!tierGatesClosed) return

    const routes = [DOMAINES_INDEX, ...publishedContentDomains().map(domainPath)]
    for (const route of routes) {
      const page = await fetchPage(route)
      const text = textOf(page.document.querySelector("main") as HTMLElement)
      expect(text, `${route} must not mention Solaire while gated`).not.toMatch(
        /solaire|photovoltaïque|énergies renouvelables/i
      )
    }
  })
})
