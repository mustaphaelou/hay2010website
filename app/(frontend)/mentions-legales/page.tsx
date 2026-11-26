import type { Metadata } from "next"

import { LegalPage } from "@/components/site/legal-document"
import { MENTIONS_LEGALES, mentionsLegalesMetadata } from "@/lib/legal"
import { requirePublishedRubrique } from "@/lib/site/gates"

/**
 * Mentions légales (#28) — the approved copy and the code-owned identity block
 * of docs/legal/analytics-consent-legal-pages.md §4.2 render from `lib/legal/`,
 * never from the content source. The gate still runs first (content-seam §5).
 */
export const metadata: Metadata = mentionsLegalesMetadata()

export default async function Page() {
  await requirePublishedRubrique("mentions-legales")
  return <LegalPage document={MENTIONS_LEGALES} />
}
