import type { Metadata } from "next"

import { PageJsonLd } from "@/components/seo/page-json-ld"
import { LegalPage } from "@/components/site/legal-document"
import { POLITIQUE_DE_CONFIDENTIALITE } from "@/lib/legal"
import { pageMetadata, resolvePageSeo } from "@/lib/seo"
import { requirePublishedRubrique } from "@/lib/site/gates"

/**
 * Politique de confidentialité (#28) — the approved copy of
 * docs/legal/analytics-consent-legal-pages.md §4.3, including the cookies
 * section (§4.4), renders from `lib/legal/`, never from the content source.
 * There is no separate cookie page, no banner and no form. The gate runs first
 * (content-seam §5).
 */
/** Unique metadata (#32): code-owned title, description and WebPage type. */
const seo = resolvePageSeo({ path: "/politique-de-confidentialite" })

export const metadata: Metadata = pageMetadata(seo)

export default async function Page() {
  await requirePublishedRubrique("politique-de-confidentialite")
  return (
    <>
      <PageJsonLd seo={seo} />
      <LegalPage document={POLITIQUE_DE_CONFIDENTIALITE} />
    </>
  )
}
