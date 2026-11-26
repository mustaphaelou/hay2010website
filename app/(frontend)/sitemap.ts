import type { MetadataRoute } from "next"

import { getContentSource } from "@/lib/content"
import { absoluteUrl } from "@/lib/seo"
import { getDomainPath, getPublishedDomains } from "@/lib/site/domaines"
import { getPublishedRubriques } from "@/lib/site/rubriques"

/**
 * Sitemap derived from the published set — never a hardcoded URL list, never a
 * gated URL (ticket #32, docs/seo/seo-metadata.md §6.2).
 *
 * A URL is listed only when both conditions hold:
 * 1. its gate is open in the content source, and
 * 2. the page is actually built, i.e. the content source returns a page
 *    document for the rubrique (the domain routes are built by construction
 *    once a domain publishes).
 *
 * Rule 2 is why the launch corpus ships skeletons for the P1 route pages: each
 * page ticket adds its document and the URL appears here on its own. A gated or
 * unbuilt route can never leak: a page is in the sitemap only if its canonical
 * route returns 200 and is indexable (§6.2). The gated named-case-study family
 * `/realisations/{slug}` has no record and therefore no entry.
 *
 * Rules:
 * - absolute apex URLs, no trailing slash, no query (built by `absoluteUrl`);
 * - no `lastModified` on static pages: the P1 corpus has no real `updatedAt`, and
 *   a build timestamp would look like churn and destroy lastmod trust (§6.2).
 *   #30 adds real `updatedAt`/`lastReviewed` values through the seam and
 *   revalidates `/sitemap.xml` after a publish;
 * - no `changeFrequency`/`priority` (ignored by search engines);
 * - no image/video sitemap, no alternates (French only).
 *
 * Rendered at build like the pages it lists; a CMS outage degrades to the
 * code-owned routes being absent, never to a 500 (§6.2).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const source = await getContentSource()
  const entries: MetadataRoute.Sitemap = []

  for (const rubrique of await getPublishedRubriques()) {
    const page = await source.getPage(rubrique.key)
    if (!page) continue
    entries.push({ url: absoluteUrl(rubrique.href) })
  }

  for (const domain of await getPublishedDomains()) {
    entries.push({ url: absoluteUrl(getDomainPath(domain.slug)) })
  }

  return entries
}
