import { describe, expect, it } from "vitest"
import type { HTMLElement } from "node-html-parser"

import {
  assertCanonicalDocument,
  assertNotFoundDocument,
  fetchPage,
  fetchSitemapPaths,
  findAnalyticsSignals,
  findConsentBanners,
  findTrackingCookies,
  isFrench,
  textOf,
  type CanonicalDocument,
} from "./helpers"
import { GATED_CASE_STUDY_ROUTES, scenario } from "./scenarios"

/**
 * /realisations over HTTP — ticket #24 acceptance.
 *
 * The page is credentials-led: it states what is verifiable — the
 * `Références sur demande` fallback, the verified qualification position, what
 * a reference request covers, the permission rules that document a project,
 * the method and the contact CTA — instead of a portfolio the company cannot
 * evidence. The suite proves the negative side too: no project cards, no
 * filter/pagination surface, no client name, logo, quote, amount or project
 * photograph, no gated claim wording, and no named-case-study route/link while
 * the family is gated.
 *
 * Decision sources:
 * - docs/content/realisations-strategy.md §2 (page spec, copy, method,
 *   explicitly-not-on-page) and §4 (detail pages gated at three records);
 * - docs/spec/p1-website-build.md §"Réalisations" (three service rows,
 *   verified qualification position, no catalogue/grid/filters/detail route);
 * - docs/company/facts-register.md §2.2 (approved reference wording; ONEE
 *   wording only behind the certificate gate), §2.3 and §6 (permissions);
 * - docs/cdc/deviation-register.md DEV-001 (credentials-led launch);
 * - docs/seo/seo-metadata.md §3.3 (title/description, gated variant) and §9
 *   (indexable, canonical, no ItemList/CreativeWork/Review until 3 projects).
 *
 * The suite is scenario-agnostic: /realisations is a published P1 rubrique in
 * every fixture state, and the service rows must follow the scenario's
 * published-domain set (a closed domain is absent from the page).
 */

const REALISATIONS = "/realisations"

/** A second member of the gated named-case-study family, never built. */
const UNKNOWN_CASE_STUDY = "/realisations/un-autre-projet"

/**
 * Fixed page metadata (docs/seo/seo-metadata.md §3.3, `agrementLive` false
 * variant): the page is indexable at launch and must not carry gated wording.
 */
const TITLE = "Réalisations et références — HAY2010"
const DESCRIPTION =
  "Références de HAY2010 en éclairage public et électrification : méthode de projet et références transmises sur demande. Plus de 10 ans d’expérience."

/** Approved reference wording (facts register §2.2, strategy §2.1). */
const REFERENCES_STATEMENT = "Références sur demande."
const REFERENCES_SENTENCE =
  "Nos références sont transmises sur demande, après accord des maîtres d’ouvrage."

/**
 * The reference CTA decided in strategy §2.1: the cleared mailbox with the
 * filtre subject, so the request lands in the right inbox thread.
 */
const REFERENCES_MAILTO =
  "mailto:contact@hay2010.ma?subject=Demande%20de%20r%C3%A9f%C3%A9rences"

/** Method block, verbatim from strategy §2.5. */
const METHOD_TITLE = "De l’étude à la réception"
const METHOD_STEPS = [
  ["Étude et dimensionnement", "Études techniques et photométriques, plans d’exécution."],
  ["Chiffrage et approvisionnement", "Chiffrage, achats et logistique du matériel."],
  ["Exécution et coordination", "Travaux, coordination de chantier et contrôle de conformité."],
  ["Réception et mise en service", "Essais, réception et mise en service."],
] as const

/** Section headings, in the order the strategy fixes for the page. */
const SECTION_HEADINGS = [
  "Ce que nous réalisons",
  "Nos qualifications",
  "Références",
  "Comment un projet est documenté",
  METHOD_TITLE,
  "Un projet d’éclairage public ou d’électrification ?",
] as const

/**
 * Gated claim wording that may never render while the certificate gate is
 * closed (facts register §2.2, §3; strategy §2.6; SEO §3.3).
 */
const GATED_CLAIM =
  /ONEE|agrément|agréée|certifi|homologu|qualification ONEE|MHVP|HTA-BT0/i

/** Client names, buyers and figures that the evidence check leaves gated. */
const GATED_REFERENCE_EVIDENCE =
  /Al Omrane|CHU Mohammed|Bank Al-Maghrib|AMEE|Aïn Taoujdate|Khemisset|Sania|Ribat Al Fath|187\s?607|78[,.]66|14 marchés|attributaire|admissible|non retenu|marché remporté|losing bid/i

/** Route/doc links that belong to the gated case-study family. */
const CASE_STUDY_HREF = /^\/realisations\/.+/

/** Fetch /realisations and assert the shared shell; returns the observable parts. */
async function fetchOpen(): Promise<CanonicalDocument> {
  const page = await fetchPage(REALISATIONS)
  expect(page.status, "/realisations is a published P1 rubrique").toBe(200)
  expect(page.headers.get("content-type") ?? "").toMatch(/text\/html/)
  return assertCanonicalDocument(page)
}

/** The `<section>` labelled by an h2 with this exact text. */
function sectionFor(main: HTMLElement, heading: string): HTMLElement {
  const match = main
    .querySelectorAll("h2")
    .find((candidate) => textOf(candidate) === heading)
  expect(match, `section « ${heading} » must render`).toBeDefined()
  const section = match?.closest("section") ?? null
  expect(section, `section « ${heading} » must be a <section> landmark`).not.toBeNull()
  return section as HTMLElement
}

/** Anchors of a region, as raw href strings. */
function hrefsIn(region: HTMLElement): string[] {
  return region
    .querySelectorAll("a[href]")
    .map((anchor) => anchor.getAttribute("href") ?? "")
}

describe(`réalisations page: credentials-led (${scenario.name})`, () => {
  it("serves one canonical French document with a single page heading", async () => {
    const canonical = await fetchOpen()

    expect(canonical.html.getAttribute("lang")).toBe("fr")
    expect(canonical.main.querySelectorAll("h1")).toHaveLength(1)
    const heading = canonical.main.querySelector("h1")
    expect(heading, "the page must carry a heading").not.toBeNull()
    expect(textOf(heading as NonNullable<typeof heading>)).toBe("Réalisations")

    // A credentials-led page, not an empty shell: substantive honest copy.
    expect(
      textOf(canonical.main).length,
      "the page must carry substantive credentials copy"
    ).toBeGreaterThan(800)
  })

  it("states « Références sur demande » with the approved fallback wording", async () => {
    const canonical = await fetchOpen()
    const mainText = textOf(canonical.main)

    // Both the hero statement and the references block carry the approved
    // wording (strategy §2.1); the exact sentence is the settled fallback.
    expect(mainText).toContain(REFERENCES_STATEMENT)
    expect(mainText).toContain(REFERENCES_SENTENCE)
  })

  it("states the qualification position honestly, with no gated claim", async () => {
    const canonical = await fetchOpen()
    const mainText = textOf(canonical.main)

    // The block renders (its title is content-owned) and explains the policy.
    expect(sectionFor(canonical.main, "Nos qualifications")).toBeDefined()
    expect(mainText).toContain("qualifications vérifiables")
    expect(mainText).toContain(
      "Aucune qualification ne figure sur cette page à ce jour"
    )
    expect(mainText).toContain(
      "L’état à jour des qualifications est communiqué sur demande"
    )

    // The ONEE wording is gated by `lib/site/claims.ts` (`live: false` while
    // both certificates are missing): no part of it may reach the page.
    expect(mainText).not.toMatch(GATED_CLAIM)
    expect(canonical.main.querySelectorAll("blockquote")).toHaveLength(0)
  })

  it("renders one service row per published domain, linking only live domain pages", async () => {
    const canonical = await fetchOpen()
    const section = sectionFor(canonical.main, "Ce que nous réalisons")
    const rows = section.querySelectorAll("li")

    // The rows are derived from the published set, never hardcoded: closing a
    // domain gate removes its row (proved by the p1-gates-closed scenario).
    expect(rows, "one service row per published domain").toHaveLength(
      scenario.publishedDomains.length
    )

    const hrefs = rows.map(
      (row) => row.querySelector("a")?.getAttribute("href") ?? ""
    )
    expect(hrefs, "each row links its published domain page").toEqual(
      scenario.publishedDomains.map((slug) => `/domaines-activite/${slug}`)
    )

    for (const slug of scenario.gatedDomains) {
      expect(
        textOf(section),
        `gated domain « ${slug} » must not appear among the service rows`
      ).not.toContain(slug)
      expect(hrefs).not.toContain(`/domaines-activite/${slug}`)
    }
  })

  it("provides no catalogue surface: no grid, filters or pagination", async () => {
    const canonical = await fetchOpen()
    const mainText = textOf(canonical.main)

    // No interactive catalogue control in the page content (the shell keeps
    // its own drawer buttons; a filter/pagination surface would live in main).
    for (const selector of ["form", "input", "select", "textarea", "button"]) {
      expect(
        canonical.main.querySelectorAll(selector),
        `unexpected <${selector}>`
      ).toHaveLength(0)
    }

    // No filter/pagination vocabulary and no paginated URL.
    expect(mainText).not.toMatch(
      /filtrer|filtres?\b|pagination|page suivante|page précédente|résultats? de recherche|trier par/i
    )
    const hrefs = hrefsIn(canonical.main)
    expect(hrefs.filter((href) => /[?&](?:page|filtre|tri)=/.test(href))).toEqual([])

    // No card wall: the page wrapper is the only <article>; a project-card
    // list would nest articles and carry dates.
    expect(
      canonical.main.querySelectorAll("article article"),
      "a project-card list would nest article elements"
    ).toHaveLength(0)
    expect(canonical.main.querySelectorAll("time")).toHaveLength(0)
  })

  it("renders no client name, logo, quote, amount or project photograph", async () => {
    const canonical = await fetchOpen()
    const main = canonical.main
    const mainText = textOf(main)

    // No image or media element: no project photograph, no logo, no badge.
    expect(
      main.querySelectorAll("img, picture, figure, video, iframe, source"),
      "no project photograph or client logo may render"
    ).toHaveLength(0)
    expect(main.querySelectorAll('[role="img"]')).toHaveLength(0)

    // No client name, buyer record, amount or procurement claim.
    expect(mainText).not.toMatch(GATED_REFERENCE_EVIDENCE)
    expect(mainText).not.toMatch(/\b(?:DH|MAD|dirhams?)\b|\bmontant\b/i)

    // No testimonial or "ils nous font confiance" band. The word
    // « témoignages » may appear in the permission rules (tasted text, not a
    // rendered quote); a quote element may not.
    expect(mainText).not.toMatch(
      /ils nous font confiance|nos clients|portfolio|portefeuille de projets/i
    )
    expect(
      main.querySelectorAll("blockquote, q"),
      "no quote or testimonial element may render"
    ).toHaveLength(0)
  })

  it("explains what a reference request covers and what backs it", async () => {
    const canonical = await fetchOpen()
    const references = sectionFor(canonical.main, "Références")
    const text = textOf(references)

    // What the request can cover (strategy §2.3/§5.1): object, service, place,
    // year and scope, with the owner's contract/réception as evidence.
    for (const expected of [
      "Objet et service",
      "Lieu et année",
      "Périmètre",
      "Pièces du dossier",
      "contrat ou procès-verbal de réception",
    ]) {
      expect(text, `the references block must state: ${expected}`).toContain(expected)
    }
  })

  it("explains how a project would be documented once permissions exist", async () => {
    const canonical = await fetchOpen()
    const section = sectionFor(canonical.main, "Comment un projet est documenté")
    const text = textOf(section)

    // The permission rules are the decided ones (facts register §6,
    // strategy §7): name, photography and testimonial each need a written
    // authorisation; a detail page only exists once they are assembled.
    expect(text).toMatch(/nom d’un client/i)
    expect(text).toMatch(/autorisation écrite/i)
    expect(text).toMatch(/photographie/i)
    expect(text).toMatch(/témoignage/i)
    expect(text).toMatch(/fiche détaillée/i)
  })

  it("renders the method block as ordered delivery steps", async () => {
    const canonical = await fetchOpen()
    const section = sectionFor(canonical.main, METHOD_TITLE)
    const lists = section.querySelectorAll("ol")
    expect(lists, "the method must render as an ordered list").toHaveLength(1)

    const steps = lists[0].querySelectorAll("li")
    expect(steps).toHaveLength(METHOD_STEPS.length)
    METHOD_STEPS.forEach(([title, body], index) => {
      expect(textOf(steps[index]), `step ${index + 1} title`).toContain(title)
      expect(textOf(steps[index]), `step ${index + 1} body`).toContain(body)
    })
  })

  it("renders the contact call to action and the reference mailto", async () => {
    const canonical = await fetchOpen()
    const cta = sectionFor(
      canonical.main,
      "Un projet d’éclairage public ou d’électrification ?"
    )
    const ctaLinks = hrefsIn(cta)
    expect(ctaLinks).toContain("/contact")
    expect(textOf(cta)).toContain("Nous contacter")

    // The reference CTA is a mailto to the cleared mailbox with the decided
    // subject — no form, no second mailbox (strategy §2.1, §7).
    const mailtos = hrefsIn(canonical.main).filter((href) =>
      href.startsWith("mailto:")
    )
    expect(mailtos.length, "the reference CTA must be a mailto").toBeGreaterThan(0)
    for (const href of mailtos) {
      expect(href).toBe(REFERENCES_MAILTO)
    }
  })

  it("labels every section heading and keeps the decided section order", async () => {
    const canonical = await fetchOpen()
    const headings = canonical.main
      .querySelectorAll("h2")
      .map((heading) => textOf(heading))

    expect(headings).toEqual([...SECTION_HEADINGS])

    for (const heading of canonical.main.querySelectorAll("h2")) {
      const id = heading.getAttribute("id")
      expect(id, "every h2 must carry an id").toBeTruthy()
      expect(heading.closest("section")?.getAttribute("aria-labelledby")).toBe(id)
    }
  })

  it("links no gated route and no named-case-study URL", async () => {
    const canonical = await fetchOpen()
    const hrefs = hrefsIn(canonical.main)

    const gated = new Set(scenario.gatedRoutes)
    expect(
      hrefs.filter((href) => gated.has(href)),
      "no gated route may be linked"
    ).toEqual([])
    expect(
      hrefs.filter((href) => CASE_STUDY_HREF.test(href)),
      "the gated case-study family must never be linked"
    ).toEqual([])
  })

  it("serves the branded 404 for the gated named-case-study family", async () => {
    for (const route of [...GATED_CASE_STUDY_ROUTES, UNKNOWN_CASE_STUDY]) {
      const page = await fetchPage(route)
      const signature = assertNotFoundDocument(page)
      expect(page.status, `${route} must be a 404`).toBe(404)
      expect(signature.heading, `${route} must serve the branded 404`).toMatch(
        /introuvable/i
      )
    }
  })

  it("keeps the case-study family out of navigation, footer and sitemap", async () => {
    const paths = await fetchSitemapPaths()
    expect(
      paths.filter((path) => path.startsWith("/realisations/")),
      "no case-study URL may be in the sitemap"
    ).toEqual([])

    // Every published page of the matrix: no header/footer link may point into
    // the gated family (the page itself never links one either, above).
    for (const route of scenario.openRoutes) {
      const page = await fetchPage(route)
      expect(page.status, `${route} must be served`).toBe(200)
      const { header, footer } = assertCanonicalDocument(page)
      for (const surface of [header, footer]) {
        expect(
          hrefsIn(surface).filter((href) => CASE_STUDY_HREF.test(href)),
          `no case-study link from ${route}`
        ).toEqual([])
      }
    }
  })

  it("exposes unique, honest, indexable metadata and no excluded structured data", async () => {
    const canonical = await fetchOpen()
    const page = canonical.page

    expect(canonical.title).toBe(TITLE)
    expect(canonical.description).toBe(DESCRIPTION)
    expect(page.document.querySelectorAll("title")).toHaveLength(1)

    // SEO §3.4: 120–160 target, hard 100–170; the page is indexable (§9).
    expect(canonical.description.length).toBeGreaterThanOrEqual(120)
    expect(canonical.description.length).toBeLessThanOrEqual(170)
    expect(isFrench(canonical.title), `title is not French: ${canonical.title}`).toBe(true)
    expect(isFrench(canonical.description)).toBe(true)
    expect(canonical.title).not.toMatch(/HAY2010 — HAY2010/)
    expect(canonical.description).not.toMatch(GATED_CLAIM)

    const robots =
      page.document
        .querySelector('meta[name="robots"]')
        ?.getAttribute("content") ?? ""
    expect(robots.toLowerCase()).not.toContain("noindex")

    // No canonical regression: one absolute apex canonical without a slash.
    const canonicalHref = page.document
      .querySelector('link[rel="canonical"]')
      ?.getAttribute("href")
    expect(canonicalHref, "the page must declare its canonical URL").toBe(
      "https://hay2010.ma/realisations"
    )

    // JSON-LD is #32's; this ticket adds no structured-data type (SEO §9: no
    // ItemList/CreativeWork/Review until three published projects).
    expect(
      page.document.querySelectorAll('script[type="application/ld+json"]'),
      "no structured data may be added by this ticket"
    ).toHaveLength(0)

    // Unique against every other published page of the scenario.
    for (const route of scenario.openRoutes) {
      if (route === REALISATIONS) continue
      const other = await fetchPage(route)
      expect(other.status, `${route} must be served`).toBe(200)
      const otherTitle = other.document.querySelector("title")?.text.trim() ?? ""
      const otherDescription =
        other.document
          .querySelector('meta[name="description"]')
          ?.getAttribute("content")
          ?.trim() ?? ""
      expect(otherTitle, `title of ${route} collides with Réalisations`).not.toBe(
        canonical.title
      )
      expect(
        otherDescription,
        `description of ${route} collides with Réalisations`
      ).not.toBe(canonical.description)
    }
  })

  it("carries no ONEE or agrément wording on any P1 scenario page", async () => {
    // The certificate gate is closed in every fixture scenario: the gated
    // claim wording must not leak into any published page of the matrix.
    for (const route of scenario.openRoutes) {
      const page = await fetchPage(route)
      expect(page.status, `${route} must be served`).toBe(200)
      const mainText = textOf(assertCanonicalDocument(page).main)
      expect(mainText, `${route} leaks gated claim wording`).not.toMatch(
        /ONEE|agrément|entreprise agréée/i
      )
    }
  })

  it("stays free of forms, analytics, consent banners and tracking cookies", async () => {
    const { page } = await fetchOpen()

    expect(findAnalyticsSignals(page)).toEqual([])
    expect(findConsentBanners(page)).toEqual([])
    expect(findTrackingCookies(page.headers)).toEqual([])
    expect(page.document.querySelectorAll("form")).toHaveLength(0)
  })

  it("renders no placeholder or coming-soon copy", async () => {
    const canonical = await fetchOpen()
    expect(textOf(canonical.main)).not.toMatch(
      /lorem ipsum|à venir|coming soon|bientôt disponible|placeholder|TODO|en construction/i
    )
  })
})
