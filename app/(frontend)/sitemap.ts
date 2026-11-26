import type { MetadataRoute } from "next"

import { getContentSource } from "@/lib/content"
import { getDomainPath, getPublishedDomains } from "@/lib/site/domaines"
import { getPublishedRubriques } from "@/lib/site/rubriques"
import { SITE_URL } from "@/lib/site/site"

/**
 * Sitemap derived from the published set — never a hardcoded URL list.
 *
 * A URL is listed only when both conditions hold:
 * 1. its gate is open in the content source, and
 * 2. the page is actually built, i.e. the content source returns a page
 *    document for the rubrique (the domain routes are built by construction
 *    once a domain publishes).
 *
 * Rule 2 is why the launch corpus ships skeletons for the five P1 route pages:
 * page tickets #22–#28 add their document and the URL appears here on its own.
 * A gated or unbuilt route can never leak (SEO doc §6.2: a page is in the
 * sitemap only if its canonical route returns 200 and is indexable).
 *
 * Ticket #32 owns the complete crawler surface (lastModified, absolute host
 * policy, robots, legacy redirects); `SITE_URL` is the single code-owned origin
 * it will take over.
 *
 * Rendered at build like the pages it lists; #30 will call
 * `revalidatePath("/sitemap.xml")` from the CMS publish hooks (SEO doc §6.2).
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const source = await getContentSource()
  const entries: MetadataRoute.Sitemap = []

  for (const rubrique of await getPublishedRubriques()) {
    const page = await source.getPage(rubrique.key)
    if (!page) continue
    entries.push({ url: `${SITE_URL}${rubrique.href === "/" ? "" : rubrique.href}` })
  }

  for (const domain of await getPublishedDomains()) {
    entries.push({ url: `${SITE_URL}${getDomainPath(domain.slug)}` })
  }

  return entries
}
