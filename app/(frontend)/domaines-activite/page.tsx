import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { DomaineIndex } from "@/components/domaines/domaine-index"
import { getPublishedDomains } from "@/lib/site/domaines"
import { pageMetadata } from "@/lib/site/metadata"
import { requirePublishedRubrique } from "@/lib/site/gates"
import { getPageDocument } from "@/lib/site/page-content"

/** Canonical route of the domain index (code-owned). */
const HREF = "/domaines-activite"

/** Unique title, description and canonical URL for the index (#22 acceptance). */
export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageDocument("domaines-activite")
  return pageMetadata({
    title: page?.title ?? "Nos domaines d’activité",
    description: page?.description,
    path: HREF,
  })
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

  return <DomaineIndex page={page} domains={domains} />
}
