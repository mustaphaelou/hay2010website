import { describe, expect, it } from "vitest"

import { baseUrl, fetchPage, SITEMAP_ORIGIN } from "./helpers"
import { CANONICAL_ORIGIN } from "./seo-expectations"
import { scenario, UNKNOWN_ROUTE } from "./scenarios"

/**
 * The single default share card — ticket #32, SEO doc §4:
 *
 * - one 1200 × 630 typographic card served over HTTP as the default
 *   `og:image`/`twitter:image` of every published page;
 * - a real PNG (signature + IHDR dimensions), not an HTML error or a redirect;
 * - an absolute, HTTPS, same-origin URL the crawler can fetch (no external
 *   asset, no localhost, no Porto demo logo);
 * - the 404 document publishes no share card.
 */

const CARD_PATH = "/og/hay2010-default.png"
const CARD_URL = `${SITEMAP_ORIGIN}${CARD_PATH}`
const MAX_BYTES = 300 * 1024

interface FetchedCard {
  status: number
  contentType: string
  bytes: Uint8Array
}

async function fetchCard(): Promise<FetchedCard> {
  const response = await fetch(`${baseUrl}${CARD_PATH}`, { redirect: "manual" })
  const bytes = new Uint8Array(await response.arrayBuffer())
  return {
    status: response.status,
    contentType: response.headers.get("content-type") ?? "",
    bytes,
  }
}

function pngSize(bytes: Uint8Array): { width: number; height: number } {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  return { width: view.getUint32(16), height: view.getUint32(20) }
}

function metaValues(
  page: import("./helpers").PageDocument,
  key: string
): string[] {
  const values: string[] = []
  for (const meta of page.document.querySelectorAll("meta")) {
    if (
      meta.getAttribute("property") === key ||
      meta.getAttribute("name") === key
    ) {
      values.push(meta.getAttribute("content") ?? "")
    }
  }
  return values
}

describe(`Open Graph card (${scenario.name})`, () => {
  it("is served over HTTP as a 1200×630 PNG under the size budget", async () => {
    const card = await fetchCard()

    expect(card.status, "the default card must be served directly").toBe(200)
    expect(card.contentType).toMatch(/^image\/png/)
    expect(
      Buffer.from(card.bytes.subarray(0, 8)).toString("hex"),
      "must be a real PNG, not an HTML error page"
    ).toBe("89504e470d0a1a0a")

    const size = pngSize(card.bytes)
    expect(size, "the card must be exactly 1200×630").toEqual({
      width: 1200,
      height: 630,
    })
    expect(card.bytes.length, "the card stays under 300 KB").toBeLessThanOrEqual(
      MAX_BYTES
    )
  })

  it("is the default og:image and twitter:image of every published page", async () => {
    for (const route of scenario.openRoutes) {
      const page = await fetchPage(route)
      expect(page.status, `${route} must be served`).toBe(200)

      const ogImage = metaValues(page, "og:image")
      expect(ogImage, `${route} declares one og:image`).toHaveLength(1)
      expect(ogImage[0], `${route} uses the default card`).toBe(CARD_URL)
      const url = new URL(ogImage[0])
      expect(url.origin, "the card must be same-origin, never external").toBe(
        CANONICAL_ORIGIN
      )
      expect(url.protocol).toBe("https:")
      expect(metaValues(page, "og:image:width")[0]).toBe("1200")
      expect(metaValues(page, "og:image:height")[0]).toBe("630")
      expect(metaValues(page, "og:image:type")[0]).toBe("image/png")

      expect(metaValues(page, "twitter:image")[0], `${route} twitter:image`).toBe(
        CARD_URL
      )
    }
  })

  it("publishes no share card on the 404 document", async () => {
    const page = await fetchPage(UNKNOWN_ROUTE)
    expect(page.status).toBe(404)
    expect(metaValues(page, "og:image")).toEqual([])
    expect(metaValues(page, "og:title")).toEqual([])
    expect(metaValues(page, "twitter:card")).toEqual([])
  })
})
