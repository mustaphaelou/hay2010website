import { expect } from "vitest"
import { parse, type HTMLElement } from "node-html-parser"

/**
 * Helpers shared by the HTTP suites.
 *
 * The suite observes the production build over HTTP only: status, headers,
 * rendered document. It never imports page components and never asserts class
 * names (docs/spec/p1-website-build.md, "Testing Decisions").
 */

const TEST_HTTP_PORT = process.env.TEST_HTTP_PORT ?? "3100"

/** Base URL of the already-running production server, without a trailing slash. */
export const baseUrl = (
  process.env.TEST_HTTP_BASE_URL ?? `http://127.0.0.1:${TEST_HTTP_PORT}`
).replace(/\/+$/, "")

export interface PageDocument {
  readonly url: string
  readonly status: number
  readonly headers: Headers
  readonly html: string
  readonly document: HTMLElement
}

/** Fetch a document from the running production server, without following redirects. */
export async function fetchPage(path = "/"): Promise<PageDocument> {
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`
  const response = await fetch(url, {
    redirect: "manual",
    headers: { accept: "text/html,application/xhtml+xml" },
  })
  const html = await response.text()
  return {
    url,
    status: response.status,
    headers: response.headers,
    html,
    document: parse(html),
  }
}

/** Fetch a sub-resource (stylesheet, font, ...) referenced by the document. */
export async function fetchText(
  href: string
): Promise<{ status: number; headers: Headers; text: string }> {
  const response = await fetch(new URL(href, `${baseUrl}/`).toString())
  return {
    status: response.status,
    headers: response.headers,
    text: await response.text(),
  }
}

/** Element children only (node-html-parser exposes text nodes too). */
export function elementChildren(parent: HTMLElement): HTMLElement[] {
  return parent.childNodes.filter(
    (node): node is HTMLElement => node.nodeType === 1
  )
}

export interface CanonicalDocument {
  readonly page: PageDocument
  readonly html: HTMLElement
  readonly body: HTMLElement
  readonly head: HTMLElement
  readonly header: HTMLElement
  readonly main: HTMLElement
  readonly footer: HTMLElement
  readonly skipLink: HTMLElement
  readonly title: string
  readonly description: string
}

/**
 * Assert the canonical document shell and return its parts.
 *
 * A canonical document has one language-bearing `<html>`, one `<header>`
 * (banner), one `<main>` (target of the skip link) and one `<footer>`
 * (contentinfo), with the skip link as the first focusable element.
 */
export function assertCanonicalDocument(page: PageDocument): CanonicalDocument {
  const { document } = page
  const html = document.querySelector("html")
  const body = document.querySelector("body")
  if (!html || !body) {
    throw new Error("the document must expose <html> and <body> elements")
  }

  const headers = document.querySelectorAll("header")
  expect(headers, "expected exactly one <header> banner landmark").toHaveLength(
    1
  )
  const mains = document.querySelectorAll("main")
  expect(mains, "expected exactly one <main> landmark").toHaveLength(1)
  const footers = document.querySelectorAll("footer")
  expect(
    footers,
    "expected exactly one <footer> contentinfo landmark"
  ).toHaveLength(1)

  const header = headers[0]
  const main = mains[0]
  const footer = footers[0]

  // Implicit ARIA roles: banner/contentinfo only hold when the landmark is a
  // direct child of <body>, not nested in a sectioning element.
  expect(
    header.parentNode,
    "<header> must be a direct child of <body> to be the banner"
  ).toBe(body)
  expect(
    footer.parentNode,
    "<footer> must be a direct child of <body> to be contentinfo"
  ).toBe(body)

  const mainId = main.getAttribute("id")
  expect(
    mainId,
    "<main> must carry an id so the skip link can target it"
  ).toBeTruthy()

  const skipLink = body.querySelectorAll("a").find((anchor) => {
    const href = anchor.getAttribute("href") ?? ""
    return href.startsWith("#")
  })
  expect(
    skipLink,
    "expected a skip link pointing inside the document"
  ).toBeDefined()
  expect(
    skipLink?.getAttribute("href"),
    "the skip link must target the main landmark"
  ).toBe(`#${mainId}`)

  const firstFocusable = elementChildren(body).find(
    (element) => element.tagName === "A" || element.tagName === "BUTTON"
  )
  expect(
    firstFocusable,
    "the skip link must be the first focusable element"
  ).toBe(skipLink)

  const title = document.querySelector("title")?.text.trim() ?? ""
  expect(title, "the document must render a <title>").not.toBe("")

  const description =
    document
      .querySelector('meta[name="description"]')
      ?.getAttribute("content")
      ?.trim() ?? ""
  expect(description, "the document must render a meta description").not.toBe(
    ""
  )

  return {
    page,
    html: html as HTMLElement,
    body: body as HTMLElement,
    head: document.querySelector("head") as HTMLElement,
    header,
    main,
    footer,
    skipLink: skipLink as HTMLElement,
    title,
    description,
  }
}

/** Fetch every stylesheet referenced by the document and return its served text. */
export async function fetchStylesheets(
  page: PageDocument
): Promise<{ href: string; text: string }[]> {
  const hrefs = page.document
    .querySelectorAll('link[rel="stylesheet"]')
    .map((link) => link.getAttribute("href"))
    .filter((href): href is string => Boolean(href))
  expect(
    hrefs.length,
    "the document must reference at least one stylesheet"
  ).toBeGreaterThan(0)

  const stylesheets: { href: string; text: string }[] = []
  for (const href of hrefs) {
    const stylesheet = await fetchText(href)
    expect(stylesheet.status, `stylesheet ${href} must be served`).toBe(200)
    stylesheets.push({ href, text: stylesheet.text })
  }
  return stylesheets
}

/** Font files the document preloads (`rel="preload" as="font"`). */
export function fontPreloadUrls(page: PageDocument): string[] {
  return page.document
    .querySelectorAll('link[rel="preload"][as="font"]')
    .map((link) => link.getAttribute("href"))
    .filter((href): href is string => Boolean(href))
}

/** French copy carries accents, typographic apostrophes or French guillemets. */
export function isFrench(text: string): boolean {
  return /[àâçéèêëîïôûùüÿœæ]|[’«»]/i.test(text)
}

const ANALYTICS_HOST_PATTERN =
  /(?:google-analytics\.com|googletagmanager\.com|doubleclick\.net|googlesyndication\.com|googleadservices\.com|connect\.facebook\.net|facebook\.net\/tr|segment\.(?:io|com)|plausible\.io|matomo\.(?:org|cloud)|piwik\.(?:org|pro)|hotjar\.com|mixpanel\.com|amplitude\.com|clarity\.ms|fullstory\.com|heap\.io|statcounter\.com|cloudflareinsights\.com|simpleanalytics\.com|ackee\.io|umami\.is)/i

const ANALYTICS_MARKER_PATTERN =
  /\b(?:dataLayer|gtag\s*\(|ga\s*\(\s*['"]create|fbq\s*\(|_paq\b|plausible\s*\(|mixpanel\.init|amplitude\.getInstance|hotjar\._hjSettings)/

/**
 * Analytics signals in the served document: known analytics hosts in script
 * sources and known client-side analytics API markers anywhere in the HTML.
 */
export function findAnalyticsSignals(page: PageDocument): string[] {
  const signals: string[] = []
  for (const script of page.document.querySelectorAll("script")) {
    const src = script.getAttribute("src")
    if (src && ANALYTICS_HOST_PATTERN.test(src))
      signals.push(`script src ${src}`)
  }
  if (ANALYTICS_HOST_PATTERN.test(page.html))
    signals.push("analytics host in document")
  if (ANALYTICS_MARKER_PATTERN.test(page.html))
    signals.push("analytics API marker in document")
  return signals
}

const CONSENT_PATTERN =
  /cookie|consent|consentement|gdpr|tarteaucitron|axeptio|didomi|onetrust|usercentrics|klaro|borlabs|cookiebot/i

/** Cookie-consent banner or dialog elements, if any. */
export function findConsentBanners(page: PageDocument): string[] {
  const found: string[] = []
  for (const element of page.document.querySelectorAll("body *")) {
    const markers = [
      "id",
      "class",
      "role",
      "aria-label",
      "aria-describedby",
      "data-testid",
    ]
      .map((attribute) => element.getAttribute(attribute))
      .filter((value): value is string => Boolean(value))
      .join(" ")
    if (markers && CONSENT_PATTERN.test(markers)) {
      found.push(`<${element.tagName.toLowerCase()} ${markers.slice(0, 120)}>`)
    }
  }
  return found
}

/** `Set-Cookie` response header values (Node exposes them through getSetCookie). */
export function getSetCookies(headers: Headers): string[] {
  const withCookies = headers as Headers & { getSetCookie?: () => string[] }
  if (typeof withCookies.getSetCookie === "function")
    return withCookies.getSetCookie()
  const raw = headers.get("set-cookie")
  return raw ? raw.split(/,(?=\s*[^;,]+=)/) : []
}

const TRACKING_COOKIE_PATTERN =
  /^(?:__utm|_ga|_gid|_gat|_gcl|_fbp|_fbc|ajs_|_hj|mp_|_clck|_clsk|_uet|_pk_|amplitude|matomo|piwik|plausible|segment|IDE$|MUID$)/i

/** Tracking cookies among the response `Set-Cookie` headers. */
export function findTrackingCookies(headers: Headers): string[] {
  return getSetCookies(headers).filter((cookie) => {
    const name = cookie.split("=")[0]?.trim() ?? ""
    return TRACKING_COOKIE_PATTERN.test(name)
  })
}

/** Visible text of a document region, whitespace-collapsed. */
export function textOf(element: HTMLElement): string {
  return element.text.replace(/\s+/g, " ").trim()
}

/** The public origin of the site (SEO §6.2: absolute, HTTPS, apex, no slash). */
export const SITEMAP_ORIGIN = "https://hay2010.ma"

/**
 * Fetch `/sitemap.xml` and return the listed pathnames (`""` for the homepage),
 * asserting the absolute-origin rule on the way.
 */
export async function fetchSitemapPaths(): Promise<string[]> {
  const sitemap = await fetchPage("/sitemap.xml")
  expect(sitemap.status, "the sitemap must be served").toBe(200)
  expect(sitemap.headers.get("content-type") ?? "").toMatch(/xml/i)

  const locations = [...sitemap.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
    match[1].trim()
  )
  expect(locations.length, "the sitemap must list at least one URL").toBeGreaterThan(0)

  return locations.map((location) => {
    const url = new URL(location)
    expect(url.origin, `sitemap URL must be absolute on the apex origin: ${location}`).toBe(
      SITEMAP_ORIGIN
    )
    expect(url.search, `sitemap URL must not carry a query: ${location}`).toBe("")
    expect(
      url.pathname.endsWith("/") && url.pathname !== "/",
      `sitemap URL must not carry a trailing slash: ${location}`
    ).toBe(false)
    return url.pathname === "/" ? "" : url.pathname
  })
}

/** A 404 document's signature: what a visitor or crawler sees on it. */
export interface NotFoundSignature {
  readonly status: number
  readonly lang: string
  readonly heading: string
  readonly title: string
  readonly navigation: string[]
  readonly mainLinks: string[]
  readonly footerLinks: string[]
}

/**
 * Assert a served document is the site's real 404 page (status, French
 * language, one canonical shell, `noindex`) and return its observable content.
 *
 * Used both for unmatched URLs and for gated routes, so the suite proves a
 * gated URL serves *the* 404 page rather than a hollow shell or a redirect.
 */
export function assertNotFoundDocument(page: PageDocument): NotFoundSignature {
  expect(page.status, "a 404 response must carry the 404 status").toBe(404)
  expect(
    page.headers.get("location"),
    "a 404 must not redirect"
  ).toBeNull()

  const canonical = assertCanonicalDocument(page)
  expect(canonical.html.getAttribute("lang")).toBe("fr")

  const robots =
    page.document
      .querySelector('meta[name="robots"]')
      ?.getAttribute("content")
      ?.toLowerCase() ?? ""
  expect(robots, "the 404 page must be noindex").toContain("noindex")

  const heading = canonical.main.querySelector("h1")?.text.replace(/\s+/g, " ").trim() ?? ""
  expect(heading, "the 404 page must carry an h1").not.toBe("")
  expect(heading, "the 404 heading must be French").toMatch(/introuvable/i)

  return {
    status: page.status,
    lang: canonical.html.getAttribute("lang") ?? "",
    heading,
    title: canonical.title,
    navigation: canonical.header
      .querySelectorAll("nav a[href]")
      .map((anchor) => anchor.getAttribute("href") ?? ""),
    mainLinks: canonical.main
      .querySelectorAll("a[href]")
      .map((anchor) => anchor.getAttribute("href") ?? ""),
    footerLinks: canonical.footer
      .querySelectorAll("a[href]")
      .map((anchor) => anchor.getAttribute("href") ?? ""),
  }
}
