import type { HTMLElement } from "node-html-parser"
import { describe, expect, it } from "vitest"

import { assertCanonicalDocument, fetchPage, textOf } from "./helpers"
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
