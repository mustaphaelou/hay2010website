import { describe, expect, it } from "vitest"

import {
  assertCanonicalDocument,
  fetchPage,
  fetchStylesheets,
  fetchText,
  findAnalyticsSignals,
  findConsentBanners,
  findTrackingCookies,
  fontPreloadUrls,
  isFrench,
  textOf,
} from "./helpers"
import { scenario } from "./scenarios"

/** Assert a regex against a large served artifact without dumping it on failure. */
function expectMatch(haystack: string, pattern: RegExp, description: string) {
  expect(pattern.test(haystack), `${description} (missing ${pattern})`).toBe(
    true
  )
}

/**
 * The shell suite (#20, extended by #21).
 *
 * It runs for every fixture scenario, so the nav/footer assertions follow the
 * published set of that scenario (5 items at P1, 4 with a closed P1 rubrique,
 * 7/8 at P2/P3) instead of a hardcoded launch list.
 */
describe(`root shell over HTTP (${scenario.name})`, () => {
  it("serves / as an HTML document", async () => {
    const page = await fetchPage("/")
    expect(page.status).toBe(200)
    expect(page.headers.get("content-type") ?? "").toMatch(/text\/html/)
    expect(page.html.trimStart()).toMatch(/^<!DOCTYPE html>/i)
  })

  it("declares French as the document language", async () => {
    const page = await fetchPage("/")
    const canonical = assertCanonicalDocument(page)
    expect(canonical.html.getAttribute("lang")).toBe("fr")
  })

  it("renders one banner, one main and one contentinfo around the homepage", async () => {
    const page = await fetchPage("/")
    const canonical = assertCanonicalDocument(page)
    // The shell keeps a single banner/contentinfo pair; the homepage trame
    // (#23) lives under the one main landmark and carries the page h1.
    expect(
      textOf(canonical.main).length,
      "the homepage must render its trame, not an empty shell"
    ).toBeGreaterThan(0)
    expect(canonical.main.querySelectorAll("h1")).toHaveLength(1)
  })

  it("opens with a skip link targeting the main landmark", async () => {
    const page = await fetchPage("/")
    const canonical = assertCanonicalDocument(page)
    expect(canonical.main.getAttribute("id")).toBe("contenu")
    expect(canonical.main.getAttribute("tabindex")).toBe("-1")
    expect(canonical.skipLink.getAttribute("href")).toBe("#contenu")
    expect(textOf(canonical.skipLink)).toBe("Aller au contenu")
  })

  it("titles and describes the page in French for HAY2010", async () => {
    const page = await fetchPage("/")
    const { title, description } = assertCanonicalDocument(page)

    expect(title).toContain("HAY2010")
    expect(title.length).toBeLessThanOrEqual(65)
    expect(isFrench(title), `title is not French: ${title}`).toBe(true)

    expect(description.length).toBeGreaterThanOrEqual(100)
    expect(description.length).toBeLessThanOrEqual(170)
    expect(
      isFrench(description),
      `description is not French: ${description}`
    ).toBe(true)
    expect(description).toMatch(/éclairage public/i)
  })

  it("renders the HAY2010 badge in the header, linking home", async () => {
    const page = await fetchPage("/")
    const { header } = assertCanonicalDocument(page)
    const badges = header.querySelectorAll('img[alt="HAY2010"]')
    expect(badges.length).toBeGreaterThan(0)
    const logoLink = badges[0].closest("a")
    expect(logoLink?.getAttribute("href")).toBe("/")
  })

  it("renders the published rubriques in the header, in CDC order", async () => {
    const page = await fetchPage("/")
    const { header } = assertCanonicalDocument(page)
    const nav = header.querySelector('nav[aria-label="Navigation principale"]')
    expect(nav, "the header must render the desktop navigation").not.toBeNull()
    if (!nav) return

    const links = nav.querySelectorAll("a[href]").map((anchor) => ({
      label: textOf(anchor),
      href: anchor.getAttribute("href") ?? "",
    }))
    expect(links).toEqual(
      scenario.navigation.map((item) => ({
        label: item.label,
        href: item.href,
      }))
    )
  })

  it("lists the footer links from the same published set", async () => {
    const page = await fetchPage("/")
    const { footer } = assertCanonicalDocument(page)
    const hrefs = footer
      .querySelectorAll("a[href]")
      .map((anchor) => anchor.getAttribute("href") ?? "")
      .filter((href) => href.startsWith("/"))
    expect(hrefs).toEqual(
      [...scenario.navigation, ...scenario.utilities].map((item) => item.href)
    )
  })

  it("renders the footer identity, mailbox and legal line", async () => {
    const page = await fetchPage("/")
    const { footer } = assertCanonicalDocument(page)
    const footerText = textOf(footer)

    expect(
      footer.querySelectorAll('img[alt="HAY2010"]').length
    ).toBeGreaterThan(0)
    expect(footerText).toContain("Local N° 21")
    expect(footerText).toContain("Hay El Manzeh")
    expect(footerText).toContain("Hay Er-Riad")
    expect(footerText).toContain("Rabat — Maroc")

    const mailtos = footer.querySelectorAll('a[href^="mailto:"]')
    expect(mailtos).toHaveLength(1)
    expect(mailtos[0].getAttribute("href")).toBe("mailto:contact@hay2010.ma")
    expect(textOf(mailtos[0])).toBe("contact@hay2010.ma")

    expect(footerText).toContain(
      "© 2026 SOCIETE HAY 2010 — Tous droits réservés"
    )
  })

  it("keeps gated channels out of the footer", async () => {
    const page = await fetchPage("/")
    const { footer } = assertCanonicalDocument(page)
    const footerText = textOf(footer)
    const hrefs = footer
      .querySelectorAll("a[href]")
      .map((anchor) => anchor.getAttribute("href") ?? "")

    expect(hrefs.filter((href) => href.startsWith("tel:"))).toEqual([])
    expect(
      hrefs.filter((href) =>
        /facebook|linkedin|instagram|twitter|x\.com|youtube|tiktok/i.test(href)
      )
    ).toEqual([])
    expect(footerText).not.toMatch(/\+212|\btéléphone\b|\btél\./i)
    expect(footerText).not.toMatch(/newsletter|s’abonner|s'abonner/i)
    expect(footerText).not.toMatch(/recrutement@/i)
  })

  it("only links to the declared published routes or contact channels", async () => {
    const page = await fetchPage("/")
    const allowed = new Set([
      ...scenario.navigation.map((item) => item.href),
      ...scenario.utilities.map((item) => item.href),
      // The homepage domain blocks link the published domain children (#23).
      ...scenario.publishedDomains.map((slug) => `/domaines-activite/${slug}`),
    ])
    const hrefs = page.document
      .querySelectorAll("a[href]")
      .map((anchor) => anchor.getAttribute("href") ?? "")
    const undeclared = [...new Set(hrefs)].filter(
      (href) =>
        !allowed.has(href) &&
        !href.startsWith("#") &&
        !href.startsWith("mailto:")
    )
    expect(undeclared).toEqual([])
  })

  it("only links to published routes, never to a closed gate", async () => {
    const page = await fetchPage("/")
    const gated = new Set(scenario.gatedRoutes)
    const gatedHrefs = page.document
      .querySelectorAll("a[href]")
      .map((anchor) => anchor.getAttribute("href") ?? "")
      .filter((href) => gated.has(href))
    expect(gatedHrefs).toEqual([])
  })

  it("removes the framework template demo content", async () => {
    const page = await fetchPage("/")
    const { body } = assertCanonicalDocument(page)
    expect(textOf(body)).not.toMatch(
      /Project ready|You may now add components|toggle dark mode/i
    )
  })

  it("ships light theme only, without the template theme provider", async () => {
    const page = await fetchPage("/")
    const { html } = assertCanonicalDocument(page)
    expect(html.getAttribute("class") ?? "").not.toMatch(/(^|\s)dark(\s|$)/)
    expect(page.html).not.toContain("next-themes")
  })

})

describe("privacy surface over HTTP", () => {
  it("renders no form element", async () => {
    const page = await fetchPage("/")
    for (const selector of ["form", "input", "textarea", "select"]) {
      expect(
        page.document.querySelectorAll(selector),
        `unexpected <${selector}>`
      ).toHaveLength(0)
    }
  })

  it("loads no analytics script", async () => {
    const page = await fetchPage("/")
    expect(findAnalyticsSignals(page)).toEqual([])
  })

  it("shows no cookie-consent banner and sets no tracking cookie", async () => {
    const page = await fetchPage("/")
    expect(findConsentBanners(page)).toEqual([])
    expect(findTrackingCookies(page.headers)).toEqual([])
  })
})

describe("brand and accessibility styling", () => {
  it("serves the HAY2010 brand palette tokens in the stylesheet", async () => {
    const page = await fetchPage("/")
    const stylesheets = await fetchStylesheets(page)
    const css = stylesheets.map((stylesheet) => stylesheet.text).join("\n")

    expectMatch(
      css,
      /--color-paper:\s*#f7f6f1/i,
      "served stylesheet must carry the paper token"
    )
    expectMatch(
      css,
      /--color-ink:\s*#111217/i,
      "served stylesheet must carry the ink token"
    )
    expectMatch(
      css,
      /--color-orange:\s*#e97425/i,
      "served stylesheet must carry the orange token"
    )

    // shadcn primitives read the semantic names, mapped onto the brand palette.
    expectMatch(
      css,
      /--background:\s*var\(--color-paper\)/i,
      "background must map to paper"
    )
    expectMatch(
      css,
      /--foreground:\s*var\(--color-ink\)/i,
      "foreground must map to ink"
    )
    expectMatch(
      css,
      /--border:\s*var\(--color-line\)/i,
      "border must map to line"
    )
    expectMatch(css, /--ring:\s*var\(--color-ink\)/i, "ring must map to ink")
  })

  it("self-hosts the Poppins typeface", async () => {
    const page = await fetchPage("/")
    const css = (await fetchStylesheets(page))
      .map((stylesheet) => stylesheet.text)
      .join("\n")

    const preloads = fontPreloadUrls(page)
    expect(
      preloads.length,
      "expected the Poppins font files to be preloaded"
    ).toBeGreaterThan(0)
    for (const preload of preloads) {
      const font = await fetchText(preload)
      expect(font.status, `font ${preload} must be served`).toBe(200)
      expect(font.text.length).toBeGreaterThan(0)
    }
    expectMatch(
      `${page.html}\n${css}`,
      /Poppins/,
      "the document must load Poppins"
    )
    expectMatch(
      css,
      /font-family:\s*["']?Poppins/i,
      "the stylesheet must embed the Poppins face"
    )
  })

  it("exposes a visible global focus ring and reduced-motion protection", async () => {
    const page = await fetchPage("/")
    const css = (await fetchStylesheets(page))
      .map((stylesheet) => stylesheet.text)
      .join("\n")

    expectMatch(
      css,
      /:focus-visible/,
      "served stylesheet must style keyboard focus"
    )
    expectMatch(css, /outline:\s*2px/, "focus ring must be 2px")
    expectMatch(
      css,
      /outline-offset:\s*2px/,
      "focus ring must be offset by 2px"
    )
    expectMatch(
      css,
      /prefers-reduced-motion:\s*reduce/,
      "motion must respect reduced-motion"
    )
  })
})
