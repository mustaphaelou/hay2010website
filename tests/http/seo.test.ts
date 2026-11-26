import { describe, expect, it } from "vitest"

import {
  assertCanonicalDocument,
  fetchPage,
  isFrench,
  SITEMAP_ORIGIN,
  type CanonicalDocument,
  type PageDocument,
} from "./helpers"
import {
  CAREERS_TITLE,
  CANONICAL_ORIGIN,
  GATED_METADATA_PATTERNS,
  NOT_FOUND_TITLE,
  OG_LOCALE,
  P1_PAGE_SEO,
} from "./seo-expectations"
import { scenario, UNKNOWN_ROUTE } from "./scenarios"

/**
 * Crawler surface — metadata half (ticket #32, SEO doc §2–§4, §6.3):
 *
 * - canonical origin/URL policy: one absolute, apex, HTTPS, query-free,
 *   trailing-slash-free, self-referencing canonical per page;
 * - the `{phrase} — HAY2010` title pattern with exactly one brand suffix and
 *   unique titles/descriptions across the scenario's published routes, in the
 *   120–160 character band for every P1 URL;
 * - `metadataBase`-resolved Open Graph (`fr_FR`) and Twitter card fields, full
 *   on every page because Next's metadata merge is shallow;
 * - baseline head fields (`lang=fr`, robots, viewport, theme colour, light
 *   scheme, no format detection, no keywords, no hreflang);
 * - the 404 document: noindex, French title, no canonical;
 * - no gated claim in the metadata of a published P1 page.
 */

/**
 * Compare French copy modulo the non-breaking space: the decided documents
 * write `:` after a normal space, while the rendered copy uses U+00A0 where the
 * typographic rule applies. Both are the same sentence.
 */
function sameCopy(actual: string, expected: string): boolean {
  return actual.replace(/\u00a0/g, " ") === expected.replace(/\u00a0/g, " ")
}

/** All `<meta>` values keyed by `property` (Open Graph) or `name`. */
function metaValues(page: PageDocument, key: string): string[] {
  const values: string[] = []
  for (const meta of page.document.querySelectorAll("meta")) {
    const property = meta.getAttribute("property")
    const name = meta.getAttribute("name")
    if (property === key || name === key) {
      values.push(meta.getAttribute("content") ?? "")
    }
  }
  return values
}

function meta(page: PageDocument, key: string): string {
  const values = metaValues(page, key)
  expect(values, `expected exactly one ${key} meta tag`).toHaveLength(1)
  return values[0]
}

function canonicalHref(page: PageDocument): string {
  const links = page.document.querySelectorAll('link[rel="canonical"]')
  expect(links, "expected exactly one canonical link").toHaveLength(1)
  return links[0].getAttribute("href") ?? ""
}

/** Fetch a route and assert the canonical document shell; return both. */
async function fetchSeo(route: string): Promise<{
  page: PageDocument
  canonical: CanonicalDocument
}> {
  const page = await fetchPage(route)
  expect(page.status, `${route} must be served`).toBe(200)
  return { page, canonical: assertCanonicalDocument(page) }
}

/** The P1 routes of this scenario that carry decided P1 metadata literals. */
function decidedP1Routes(): string[] {
  return scenario.openRoutes.filter((route) => route in P1_PAGE_SEO)
}

describe(`SEO metadata (${scenario.name})`, () => {
  it("publishes the approved title and description for every decided P1 route", async () => {
    for (const route of decidedP1Routes()) {
      const { canonical } = await fetchSeo(route)
      const expected = P1_PAGE_SEO[route]

      expect(canonical.title, `${route} title`).toBe(expected.title)
      expect(
        sameCopy(canonical.description, expected.description),
        `${route} description`
      ).toBe(true)
    }
  })

  it("uses the approved Carrières title and the current F-113 description", async () => {
    if (!scenario.openRoutes.includes("/carrieres")) return
    const { canonical } = await fetchSeo("/carrieres")

    expect(canonical.title).toBe(CAREERS_TITLE)
    expect(sameCopy(canonical.description, scenario.careers.description)).toBe(
      true
    )
  })

  it("keeps every published route's title and description unique and within bounds", async () => {
    const titles = new Map<string, string>()
    const descriptions = new Map<string, string>()
    const p1 = new Set(decidedP1Routes())

    for (const route of scenario.openRoutes) {
      const { canonical } = await fetchSeo(route)

      if (titles.has(canonical.title)) {
        throw new Error(
          `title "${canonical.title}" is shared by ${titles.get(canonical.title)} and ${route}`
        )
      }
      titles.set(canonical.title, route)

      if (descriptions.has(canonical.description)) {
        throw new Error(
          `description of ${route} duplicates ${descriptions.get(canonical.description)}`
        )
      }
      descriptions.set(canonical.description, route)

      if (route === "/") {
        // The homepage is brand-first and uses `title.absolute` (§3.2).
        expect(canonical.title).toMatch(/^HAY2010 — /)
      } else {
        expect(
          canonical.title,
          `${route} title must end with exactly one brand suffix`
        ).toMatch(/ — HAY2010$/)
      }
      expect(
        (canonical.title.match(/HAY2010/g) ?? []).length,
        `${route} title must carry the brand name once`
      ).toBe(1)
      expect(canonical.title.length, `${route} title length`).toBeLessThanOrEqual(65)
      expect(isFrench(canonical.title), `${route} title must be French`).toBe(true)

      if (p1.has(route)) {
        expect(
          canonical.description.length,
          `${route} title must be within the P1 description band`
        ).toBeGreaterThanOrEqual(120)
        expect(
          canonical.description.length,
          `${route} description must be within the P1 description band`
        ).toBeLessThanOrEqual(160)
      }
    }
  })

  it("declares one absolute, apex, HTTPS, slash-free canonical per page", async () => {
    for (const route of scenario.openRoutes) {
      const { page } = await fetchSeo(route)
      const href = canonicalHref(page)
      const url = new URL(href)

      expect(url.origin, `${route} canonical origin`).toBe(CANONICAL_ORIGIN)
      expect(url.protocol, `${route} canonical protocol`).toBe("https:")
      expect(url.hostname, `${route} canonical host`).not.toMatch(/^www\./)
      expect(url.search, `${route} canonical must be query-free`).toBe("")
      expect(url.hash, `${route} canonical must be fragment-free`).toBe("")
      expect(
        url.pathname !== "/" && url.pathname.endsWith("/"),
        `${route} canonical must not carry a trailing slash`
      ).toBe(false)

      const expectedPath = route === "/" ? "/" : route
      expect(url.pathname, `${route} canonical path`).toBe(expectedPath)
      expect(href, "canonical must be the self-referencing absolute URL").toBe(
        `${SITEMAP_ORIGIN}${route === "/" ? "" : route}`
      )
    }
  })

  it("emits the full Open Graph and Twitter card on every page", async () => {
    for (const route of scenario.openRoutes) {
      const { page, canonical } = await fetchSeo(route)

      expect(meta(page, "og:locale"), `${route} og:locale`).toBe(OG_LOCALE)
      expect(meta(page, "og:site_name"), `${route} og:site_name`).toBe("HAY2010")
      expect(meta(page, "og:type"), `${route} og:type`).toBe("website")
      expect(meta(page, "og:title"), `${route} og:title`).toBe(canonical.title)
      expect(
        sameCopy(meta(page, "og:description"), canonical.description),
        `${route} og:description`
      ).toBe(true)
      expect(meta(page, "og:url"), `${route} og:url`).toBe(canonicalHref(page))

      const image = new URL(meta(page, "og:image"))
      expect(image.origin, `${route} og:image must be absolute on the site`).toBe(
        CANONICAL_ORIGIN
      )
      expect(image.protocol).toBe("https:")
      expect(meta(page, "og:image:width"), `${route} og:image:width`).toBe("1200")
      expect(meta(page, "og:image:height"), `${route} og:image:height`).toBe("630")
      expect(meta(page, "og:image:type"), `${route} og:image:type`).toMatch(
        /^image\//
      )
      expect(
        meta(page, "og:image:alt").length,
        `${route} og:image:alt must be present`
      ).toBeGreaterThan(0)

      expect(meta(page, "twitter:card")).toBe("summary_large_image")
      expect(meta(page, "twitter:title")).toBe(canonical.title)
      expect(
        sameCopy(meta(page, "twitter:description"), canonical.description)
      ).toBe(true)
      expect(new URL(meta(page, "twitter:image")).origin).toBe(CANONICAL_ORIGIN)
      // No official account is confirmed: never invent a @handle (SEO §4.2).
      expect(metaValues(page, "twitter:site")).toEqual([])
      expect(metaValues(page, "twitter:creator")).toEqual([])
      // No alternate locale: French only (SEO §4.2).
      expect(metaValues(page, "og:locale:alternate")).toEqual([])
    }
  })

  it("sets the baseline head fields: French, indexable, light, no bad hints", async () => {
    for (const route of scenario.openRoutes) {
      const { page, canonical } = await fetchSeo(route)

      expect(canonical.html.getAttribute("lang")).toBe("fr")
      expect(meta(page, "robots")).toMatch(/index/)
      expect(meta(page, "robots")).toMatch(/follow/)
      expect(meta(page, "robots")).not.toMatch(/noindex|nofollow/)
      expect(meta(page, "googlebot")).toMatch(/max-image-preview:\s*large/)
      expect(meta(page, "googlebot")).toMatch(/max-snippet:\s*-1/)
      expect(meta(page, "color-scheme")).toBe("light")
      expect(meta(page, "theme-color").toUpperCase()).toBe("#F7F6F1")
      expect(meta(page, "viewport")).toMatch(/width=device-width/)
      expect(meta(page, "viewport")).toMatch(/initial-scale=1/)
      expect(meta(page, "viewport")).toMatch(/viewport-fit=cover/)
      expect(meta(page, "viewport")).not.toMatch(/maximum-scale|user-scalable=no/)
      expect(meta(page, "format-detection")).toMatch(/telephone=no/)
      expect(meta(page, "format-detection")).toMatch(/email=no/)
      expect(meta(page, "format-detection")).toMatch(/address=no/)

      // Not emitted: keyword lists, author/publisher hints, hreflang.
      expect(metaValues(page, "keywords")).toEqual([])
      expect(metaValues(page, "author")).toEqual([])
      expect(
        page.document.querySelectorAll('link[rel="alternate"][hreflang]')
      ).toHaveLength(0)
    }
  })

  it("keeps the 404 and gated documents non-indexable with no canonical", async () => {
    for (const route of [UNKNOWN_ROUTE, ...scenario.gatedRoutes]) {
      const page = await fetchPage(route)
      expect(page.status, `${route} must be a 404`).toBe(404)

      // Next's not-found document adds its own noindex hint; the branded
      // document adds the full noindex, nofollow directive. What matters is
      // that the served 404 is non-indexable on both axes.
      const robots = metaValues(page, "robots").join(", ").toLowerCase()
      expect(robots, "a 404 must be noindex").toMatch(/noindex/)
      expect(robots, "a 404 must be nofollow").toMatch(/nofollow/)

      expect(
        page.document.querySelectorAll('link[rel="canonical"]'),
        "a 404 must not declare a canonical"
      ).toHaveLength(0)
      expect(page.document.querySelector("title")?.text.trim()).toBe(
        NOT_FOUND_TITLE
      )
    }
  })

  it("never publishes a gated claim in the metadata of a P1 page", async () => {
    for (const route of decidedP1Routes()) {
      const { page } = await fetchSeo(route)
      const head = page.document.querySelector("head")?.text ?? ""
      const metadata = page.document
        .querySelectorAll("meta")
        .map((tag) => tag.getAttribute("content") ?? "")
        .join(" \n ")

      for (const pattern of GATED_METADATA_PATTERNS) {
        expect(
          pattern.test(metadata),
          `${route} metadata must not match gated claim ${pattern}`
        ).toBe(false)
      }
      expect(
        GATED_METADATA_PATTERNS.some((pattern) => pattern.test(head)),
        `${route} head must not carry a gated claim`
      ).toBe(false)
    }
  })
})
