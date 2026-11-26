import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { DomaineIndex } from "@/components/domaines/domaine-index"
import { PageJsonLd } from "@/components/seo/page-json-ld"
import { pageMetadata, resolvePageSeo } from "@/lib/seo"
import { getPublishedDomains } from "@/lib/site/domaines"
import { requirePublishedRubrique } from "@/lib/site/gates"
import { getPageDocument } from "@/lib/site/page-content"

/** Canonical route of the domain index (code-owned). */
const HREF = "/domaines-activite"

/** Unique title, description and canonical URL for the index (#22, #32). */
async function indexSeo() {
  const page = await getPageDocument("domaines-activite")
  return resolvePageSeo({ path: HREF, description: page?.description })
}

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await indexSeo())
}

/**
 * Nos domaines d'activité — index (ticket #22).
 *
 * The gate guard stays the first line (docs/build/content-seam.md §5). The
 * presentation and the list are content: the page document supplies the copy
 * and the ordering block, the seam supplies exactly the published domains, so
 * a gated domain is absent from the index by construction.
 */
export default async function Page() {
  await requirePublishedRubrique("domaines-activite")

  const [page, domains] = await Promise.all([
    getPageDocument("domaines-activite"),
    getPublishedDomains(),
  ])
  if (!page) notFound()

  return (
    <>
      <PageJsonLd seo={await indexSeo()} />
      <DomaineIndex page={page} domains={domains} />
    </>
  )
}
