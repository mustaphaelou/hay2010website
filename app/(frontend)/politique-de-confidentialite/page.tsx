import type { Metadata } from "next"

import { LegalPage } from "@/components/site/legal-document"
import {
  POLITIQUE_DE_CONFIDENTIALITE,
  politiqueDeConfidentialiteMetadata,
} from "@/lib/legal"
import { requirePublishedRubrique } from "@/lib/site/gates"

/**
 * Politique de confidentialité (#28) — the approved copy of
 * docs/legal/analytics-consent-legal-pages.md §4.3, including the cookies
 * section (§4.4), renders from `lib/legal/`, never from the content source.
 * There is no separate cookie page, no banner and no form. The gate runs first
 * (content-seam §5).
 */
export const metadata: Metadata = politiqueDeConfidentialiteMetadata()

export default async function Page() {
  await requirePublishedRubrique("politique-de-confidentialite")
  return <LegalPage document={POLITIQUE_DE_CONFIDENTIALITE} />
}
