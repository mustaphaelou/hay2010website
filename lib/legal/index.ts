/**
 * Code-owned legal content (ticket #28).
 *
 * Nothing here is read from the content source: the identity block, the
 * approved mentions légales and politique de confidentialité copy are decisions
 * (docs/company/facts-register.md §2.1,
 * docs/legal/analytics-consent-legal-pages.md §4), so the CMS admin can neither
 * edit nor remove them (#30 verifies).
 *
 * Routes themselves stay in the rubrique registry (`lib/site/rubriques.ts`) and
 * their publish state in the content source, so the usual gate still decides
 * whether a legal page is reachable.
 */
export { LEGAL_IDENTITY, LAST_REVIEWED, LAST_REVIEWED_LABEL } from "./identity"
export { MENTIONS_LEGALES } from "./mentions-legales"
export {
  mentionsLegalesMetadata,
  politiqueDeConfidentialiteMetadata,
} from "./metadata"
export type { LegalDocument, LegalSection } from "./types"
