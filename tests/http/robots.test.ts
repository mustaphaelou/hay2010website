import { describe, expect, it } from "vitest"

import { baseUrl, fetchPage, SITEMAP_ORIGIN } from "./helpers"
import { scenario } from "./scenarios"

/**
 * `robots.txt` production rules — ticket #32, SEO doc §6.1:
 *
 * - production allows the public site, disallows the developer surfaces
 *   (`/admin`, `/api/`, `/preview/`) and advertises the absolute sitemap URL;
 * - it is NOT the staging disallow-all: staging keeps #31's proxy
 *   short-circuit (`SITE_ENV=staging`), which this production build proves it
 *   does not shadow;
 * - it never disallows the crawl resources (`/_next/`, `/og/`), the legacy
 *   WordPress paths (the status codes do that work) or the sitemap;
 * - no public response carries the staging `X-Robots-Tag`, and the sitemap and
 *   robots file are indexable.
 */

const SITEMAP_URL = `${SITEMAP_ORIGIN}/sitemap.xml`

async function fetchRobots(): Promise<{
  status: number
  contentType: string
  headers: Headers
  body: string
}> {
  const response = await fetch(`${baseUrl}/robots.txt`, { redirect: "manual" })
  return {
    status: response.status,
    contentType: response.headers.get("content-type") ?? "",
    headers: response.headers,
    body: await response.text(),
  }
}

/** A directive line, e.g. `Disallow: /admin` (case-insensitive). */
function hasDirective(body: string, verb: string, value: string): boolean {
  const pattern = new RegExp(
    `^\\s*${verb}\\s*:\\s*${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`,
    "im"
  )
  return pattern.test(body)
}

describe(`robots.txt (${scenario.name})`, () => {
  it("serves the production rules: allow public, disallow admin and API", async () => {
    const robots = await fetchRobots()

    expect(robots.status, "/robots.txt must be served").toBe(200)
    expect(robots.contentType).toMatch(/^text\/plain/)
    expect(robots.body, "the production rules file").not.toMatch(/<html/i)

    expect(robots.body, "one user-agent group").toMatch(/^User-Agent:\s*\*/im)
    expect(hasDirective(robots.body, "Allow", "/"), "Allow: /").toBe(true)
    expect(hasDirective(robots.body, "Disallow", "/admin"), "Disallow: /admin").toBe(
      true
    )
    expect(hasDirective(robots.body, "Disallow", "/api/"), "Disallow: /api/").toBe(
      true
    )
    expect(
      hasDirective(robots.body, "Disallow", "/preview/"),
      "Disallow: /preview/"
    ).toBe(true)

    expect(
      robots.body,
      "production must not serve the staging disallow-all"
    ).not.toMatch(/^\s*Disallow:\s*\/\s*$/im)

    expect(
      robots.body,
      "the sitemap is advertised as an absolute apex URL"
    ).toContain(`Sitemap: ${SITEMAP_URL}`)
  })

  it("does not block the resources crawlers need or the legacy URLs", async () => {
    const { body } = await fetchRobots()

    for (const path of [
      "/_next/",
      "/og/",
      "/sitemap.xml",
      "/robots.txt",
      "/wp-",
      "/blog",
      "/project",
      "/member",
      "/category",
    ]) {
      expect(
        hasDirective(body, "Disallow", path),
        `robots.txt must not disallow ${path}`
      ).toBe(false)
    }
    // No crawl-delay/host/clean-param directives (ignored or single-engine).
    expect(body).not.toMatch(/crawl-delay|^\s*Host\s*:|request-rate|clean-param/im)
  })

  it("keeps public responses free of the staging noindex header", async () => {
    for (const path of ["/", "/a-propos", "/robots.txt", "/sitemap.xml"]) {
      const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" })
      expect(
        response.headers.get("x-robots-tag"),
        `${path} must not advertise a staging directive in production`
      ).toBeNull()
    }
  })

  it("advertises a sitemap that is actually served", async () => {
    const { body } = await fetchRobots()
    expect(body).toContain(`Sitemap: ${SITEMAP_URL}`)

    const sitemap = await fetchPage("/sitemap.xml")
    expect(sitemap.status).toBe(200)
    expect(sitemap.headers.get("content-type") ?? "").toMatch(/xml/i)
    expect(sitemap.headers.get("x-robots-tag")).toBeNull()
  })
})
