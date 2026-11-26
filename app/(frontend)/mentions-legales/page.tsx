import type { Metadata } from "next"

import { PageJsonLd } from "@/components/seo/page-json-ld"
import { LegalPage } from "@/components/site/legal-document"
import { MENTIONS_LEGALES } from "@/lib/legal"
import { pageMetadata, resolvePageSeo } from "@/lib/seo"
import { requirePublishedRubrique } from "@/lib/site/gates"

/**
 * Mentions légales (#28) — the approved copy and the code-owned identity block
 * of docs/legal/analytics-consent-legal-pages.md §4.2 render from `lib/legal/`,
 * never from the content source. The gate still runs first (content-seam §5).
 */
/** Unique metadata (#32): code-owned title, description and WebPage type. */
const seo = resolvePageSeo({ path: "/mentions-legales" })

export const metadata: Metadata = pageMetadata(seo)

export default async function Page() {
  await requirePublishedRubrique("mentions-legales")
  return (
    <>
      <PageJsonLd seo={seo} />
      <LegalPage document={MENTIONS_LEGALES} />
    </>
  )
}
