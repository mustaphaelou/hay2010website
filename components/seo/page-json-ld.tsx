import { buildPageGraph, type PageSeo } from "@/lib/seo"

/**
 * One native `<script type="application/ld+json">` per page — a single
 * `@graph` with Organization, WebSite (homepage only) and WebPage
 * (docs/seo/seo-metadata.md §5.6).
 *
 * A native script, not `next/script`: JSON-LD is data, not executable code, and
 * the Metadata API has no JSON-LD field. `<` is escaped because a CMS-provided
 * title is user-controlled; U+2028/U+2029 are escaped for old parsers.
 */
function serialize(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029")
}

/** The structured-data block of one page, rendered inside the page tree. */
export function PageJsonLd({ seo }: { seo: PageSeo }) {
  return (
    <script
      type="application/ld+json"
      // The payload is a serialised typed object, not HTML interpolation.
      dangerouslySetInnerHTML={{ __html: serialize(buildPageGraph(seo)) }}
    />
  )
}
