import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { DomaineIndex } from "@/components/domaines/domaine-index"
import { PageJsonLd } from "@/components/seo/page-json-ld"
import { pageMetadata } from "@/lib/seo"
import { getPublishedDomains } from "@/lib/site/domaines"
import { requirePublishedRubrique } from "@/lib/site/gates"
import { getRubriquePageContext } from "@/lib/site/page-context"

/** Unique title, description and canonical URL for the index (#22, #32). */
async function indexContext() {
  return getRubriquePageContext("domaines-activite")
}

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await indexContext()
  return pageMetadata(seo)
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

  const [{ model: page, seo }, domains] = await Promise.all([
    indexContext(),
    getPublishedDomains(),
  ])
  if (!page) notFound()

  return (
    <>
      <PageJsonLd seo={seo} />
      <DomaineIndex page={page} domains={domains} />
    </>
  )
}
