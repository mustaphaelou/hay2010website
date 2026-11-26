import type { Metadata } from "next"

import { RealisationsPage } from "@/components/realisations/realisations-page"
import { PageJsonLd } from "@/components/seo/page-json-ld"
import type { PageDocument } from "@/lib/content/types"
import { pageMetadata, resolvePageSeo } from "@/lib/seo"
import { getPublishedDomains } from "@/lib/site/domaines"
import { requirePublishedRubrique } from "@/lib/site/gates"
import { getPageDocument } from "@/lib/site/page-content"

/**
 * /realisations — the credentials-led references page (ticket #24).
 *
 * Trame and copy: docs/content/realisations-strategy.md §2. The page states
 * what is verifiable (`Références sur demande`, the qualification position,
 * what a reference request covers, the permission rules, the method) instead
 * of a portfolio the company cannot evidence; no catalogue, grid, filter,
 * pagination, client name/logo/quote, project photograph or detail link
 * renders (DEV-001). The named-case-study family is gated by a code-owned
 * constant (`lib/site/realisations.ts`) and served as a 404 by `proxy.ts`.
 *
 * The publication gate is the first statement of the page component, per the
 * content-seam contract (docs/build/content-seam.md §5). The service rows come
 * from the published-domain set through the seam, so a gated domain is absent
 * from the page by construction.
 */

const KEY = "realisations" as const
const HREF = "/realisations"

/**
 * Unique metadata (#32): docs/seo/seo-metadata.md §3.3 fixes the title and the
 * `agrementLive: false` description variant ships until both ONEE certificates
 * are filed; the description is the page model's decided copy.
 */
async function realisationsSeo() {
  const page = requireCopy(await getPageDocument(KEY))
  return resolvePageSeo({ path: HREF, description: page.description })
}

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await realisationsSeo())
}

/**
 * A published page cannot ship without its title and description (SEO §3.5):
 * throw so a broken corpus fails the build instead of rendering an empty head.
 */
function requireCopy(
  page: PageDocument | null
): PageDocument & { readonly title: string; readonly description: string } {
  if (!page?.title || !page.description) {
    throw new Error(
      "The « Réalisations » document must carry a title and a description (docs/seo/seo-metadata.md §3)."
    )
  }
  return page as PageDocument & {
    readonly title: string
    readonly description: string
  }
}

export default async function Page() {
  await requirePublishedRubrique("realisations")

  const [page, domains] = await Promise.all([
    getPageDocument(KEY),
    getPublishedDomains(),
  ])

  return (
    <>
      <PageJsonLd seo={await realisationsSeo()} />
      <RealisationsPage page={requireCopy(page)} domains={domains} />
    </>
  )
}
