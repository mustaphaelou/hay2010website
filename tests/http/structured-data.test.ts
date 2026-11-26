import { describe, expect, it } from "vitest"

import { assertCanonicalDocument, fetchPage, SITEMAP_ORIGIN } from "./helpers"
import { P1_PAGE_SEO, GATED_METADATA_PATTERNS } from "./seo-expectations"
import { scenario, UNKNOWN_ROUTE } from "./scenarios"

/**
 * Structured data — ticket #32 acceptance, SEO doc §5:
 *
 * - one native JSON-LD block per page, one `@graph`, stable `@id`s;
 * - `Organization` on every page from facts-register-cleared identity only
 *   (name, legal name, URL, `contact@` mailbox, registered seat, RC/ICE
 *   identifiers, the four approved services);
 * - `WebPage` on every page with the accurate subtype (`AboutPage`,
 *   `ContactPage`, `CollectionPage`, otherwise `WebPage`);
 * - `WebSite` on the homepage only, no `SearchAction`;
 * - no `LocalBusiness`/`Electrician`, `JobPosting`, `BreadcrumbList`,
 *   `Review`, `AggregateRating`, `Service`, `Person` or `Article` at launch,
 *   and no gated property (`sameAs`, `logo`, `telephone`, `foundingDate`,
 *   `areaServed`, …);
 * - nothing indexable on a 404, and no gated URL anywhere in the graph.
 */

interface JsonLdNode {
  "@type": string
  "@id"?: string
  [key: string]: unknown
}

interface JsonLdGraph {
  "@context": string
  "@graph": JsonLdNode[]
}

/** Read and parse the single JSON-LD graph of a page. */
function readGraph(page: import("./helpers").PageDocument): JsonLdGraph {
  const scripts = page.document.querySelectorAll(
    'script[type="application/ld+json"]'
  )
  expect(scripts, "exactly one JSON-LD block per page").toHaveLength(1)
  const text = scripts[0].text
  expect(text.trim(), "the JSON-LD block must not be empty").not.toBe("")
  const parsed = JSON.parse(text) as JsonLdGraph
  expect(parsed["@context"], "the graph must declare schema.org").toBe(
    "https://schema.org"
  )
  expect(Array.isArray(parsed["@graph"]), "one @graph array").toBe(true)
  return parsed
}

/** Typed node lookup: exactly `count` nodes of a type. */
function nodesOfType(graph: JsonLdGraph, type: string): JsonLdNode[] {
  return graph["@graph"].filter((node) => node["@type"] === type)
}

/** Serialise any JSON-LD value for denylist scans. */
function graphText(value: unknown): string {
  return JSON.stringify(value)
}

describe(`structured data (${scenario.name})`, () => {
  it("serves Organization + WebPage on every published page", async () => {
    for (const route of scenario.openRoutes) {
      const page = await fetchPage(route)
      expect(page.status, `${route} must be served`).toBe(200)
      const graph = readGraph(page)

      expect(
        nodesOfType(graph, "Organization"),
        `${route} must publish exactly one Organization`
      ).toHaveLength(1)
      expect(
        nodesOfType(graph, "WebPage").length +
          nodesOfType(graph, "AboutPage").length +
          nodesOfType(graph, "ContactPage").length +
          nodesOfType(graph, "CollectionPage").length,
        `${route} must publish exactly one WebPage node`
      ).toBe(1)
    }
  })

  it("declares the Organization from cleared identity facts only", async () => {
    const page = await fetchPage("/")
    const graph = readGraph(page)
    const organization = nodesOfType(graph, "Organization")[0]

    expect(organization["@id"]).toBe(`${SITEMAP_ORIGIN}/#organization`)
    expect(organization.name).toBe("HAY2010")
    expect(organization.alternateName).toEqual(["HAY 2010"])
    expect(organization.legalName).toBe("SOCIETE HAY 2010")
    expect(organization.url).toBe(SITEMAP_ORIGIN)
    expect(organization.email).toBe("contact@hay2010.ma")
    expect(organization.description).toMatch(/plus de 10 ans/i)

    const address = organization.address as Record<string, unknown>
    expect(address["@type"]).toBe("PostalAddress")
    expect(address.streetAddress).toBe("Local N° 21, Hay El Manzeh, Hay Er-Riad")
    expect(address.addressLocality).toBe("Rabat")
    expect(address.addressCountry).toBe("MA")

    const identifiers = organization.identifier as Record<string, unknown>[]
    expect(identifiers).toEqual(
      expect.arrayContaining([
        { "@type": "PropertyValue", name: "RC", value: "87305" },
        { "@type": "PropertyValue", name: "ICE", value: "001459327000056" },
      ])
    )
    expect(identifiers, "only the cleared RC and ICE identifiers").toHaveLength(2)

    expect(organization.knowsAbout).toEqual([
      "Éclairage public",
      "Réseaux HTA/MT & MT/BT",
      "Postes de transformation",
      "CFO/CFA",
    ])
  })

  it("publishes WebSite on the homepage only", async () => {
    for (const route of scenario.openRoutes) {
      const graph = readGraph(await fetchPage(route))
      const websites = nodesOfType(graph, "WebSite")
      if (route === "/") {
        expect(websites, "the homepage carries the one WebSite node").toHaveLength(
          1
        )
        const website = websites[0]
        expect(website["@id"]).toBe(`${SITEMAP_ORIGIN}/#website`)
        expect(website.url).toBe(SITEMAP_ORIGIN)
        expect(website.name).toBe("HAY2010")
        expect(website.inLanguage).toBe("fr")
        expect(website.publisher).toEqual({
          "@id": `${SITEMAP_ORIGIN}/#organization`,
        })
        // No site search, no demo tagline (SEO §5.3).
        expect(website.potentialAction).toBeUndefined()
        expect(website.description).toBeUndefined()
      } else {
        expect(websites, `${route} must not publish a second WebSite`).toEqual([])
      }
    }
  })

  it("gives every page one WebPage node with the right subtype and stable ids", async () => {
    for (const route of scenario.openRoutes) {
      const page = await fetchPage(route)
      const canonical = assertCanonicalDocument(page)
      const graph = readGraph(page)
      const webPage = graph["@graph"].find((node) =>
        ["WebPage", "AboutPage", "ContactPage", "CollectionPage"].includes(
          node["@type"]
        )
      )
      expect(webPage, `${route} must carry a WebPage node`).toBeDefined()
      if (!webPage) continue

      const expectedType = P1_PAGE_SEO[route]?.webPageType ?? "WebPage"
      expect(webPage["@type"], `${route} WebPage subtype`).toBe(expectedType)
      const canonicalUrl = `${SITEMAP_ORIGIN}${route === "/" ? "" : route}`
      expect(webPage["@id"]).toBe(`${canonicalUrl}#webpage`)
      expect(webPage.url).toBe(canonicalUrl)
      // `name` is the resolved title: one brand suffix, same as <title>.
      expect(webPage.name).toBe(canonical.title)
      expect(webPage.isPartOf).toBe(SITEMAP_ORIGIN)
      expect(webPage.about).toEqual({
        "@id": `${SITEMAP_ORIGIN}/#organization`,
      })
      expect(webPage.inLanguage).toBe("fr")
      // No unsupported per-page properties at launch (SEO §5.4).
      expect(webPage.breadcrumb).toBeUndefined()
      expect(webPage.potentialAction).toBeUndefined()
      expect(webPage.primaryImageOfPage).toBeUndefined()
      expect(webPage.dateModified).toBeUndefined()
    }
  })

  it("uses only the allowed entity types — no gated schema.org type", async () => {
    const allowed = new Set([
      "Organization",
      "WebSite",
      "WebPage",
      "AboutPage",
      "ContactPage",
      "CollectionPage",
      "PostalAddress",
      "PropertyValue",
    ])
    const forbidden =
      /"@type"\s*:\s*"(?:LocalBusiness|Electrician|ProfessionalService|JobPosting|BreadcrumbList|Review|AggregateRating|Rating|Service|OfferCatalog|Offer|Product|FAQPage|HowTo|Event|Person|Article|NewsArticle|SearchAction|ImageObject)"/

    for (const route of scenario.openRoutes) {
      const graph = readGraph(await fetchPage(route))
      for (const node of graph["@graph"]) {
        expect(allowed.has(node["@type"]), `${route}: ${node["@type"]}`).toBe(true)
        // Nested nodes (address, identifier, publisher) are part of the graph.
        for (const nestedType of JSON.stringify(node).matchAll(/"@type"\s*:\s*"([^"]+)"/g)) {
          expect(
            allowed.has(nestedType[1]),
            `${route}: nested ${nestedType[1]}`
          ).toBe(true)
        }
      }
      expect(graphText(graph["@graph"]), `${route} must not publish a gated type`).not.toMatch(
        forbidden
      )
    }
  })

  it("carries no gated property or claim in any JSON-LD block", async () => {
    const forbiddenProperties =
      /"(?:sameAs|logo|telephone|foundingDate|areaServed|geo|openingHours|openingHoursSpecification|priceRange|numberOfEmployees|aggregateRating|review|awards|brand|slogan|contactPoint|vatID|taxID|duns|legalRepresentative)"\s*:/
    const gatedUrls =
      /"(?:https?:\/\/hay2010\.ma)?(?:\/moyens-et-competences|\/references-et-partenaires|\/actualites|\/realisations\/[^"]+|\/en)(?:\/|")/

    for (const route of scenario.openRoutes) {
      const graph = readGraph(await fetchPage(route))
      const text = graphText(graph["@graph"])
      expect(text, `${route} must not publish a gated JSON-LD property`).not.toMatch(
        forbiddenProperties
      )
      expect(text, `${route} must not reference a gated URL`).not.toMatch(
        gatedUrls
      )
      for (const pattern of GATED_METADATA_PATTERNS) {
        expect(
          pattern.test(text),
          `${route} JSON-LD must not match gated claim ${pattern}`
        ).toBe(false)
      }
    }
  })

  it("publishes no structured data on a 404", async () => {
    for (const route of [UNKNOWN_ROUTE, ...scenario.gatedRoutes]) {
      const page = await fetchPage(route)
      expect(page.status).toBe(404)
      expect(
        page.document.querySelectorAll('script[type="application/ld+json"]'),
        `${route} must not carry JSON-LD`
      ).toHaveLength(0)
    }
  })
})
