/**
 * Code-owned « repères » band of the Accueil trame (ticket #23) — approved
 * facts the owner can never edit (content model §3: approved claims are
 * code-owned; the facts register §2.2 is the only approved wording).
 *
 * The CMS `homepage` global stores prose only. This module supplies the repères
 * block the CMS provider injects, so the six values can never drift through an
 * admin edit: `Plus de 10 ans d’expérience` is an approved claim, `Rabat —
 * Maroc` is the identity base, and the four service words are the code-owned
 * service names of the domain registry.
 *
 * The fixture provider carries the same six values as decided copy in
 * `content/fixtures/site.json`; `npm run test:cms` compares the rendered pages
 * under both providers, so a drift between this module and the fixture is a red
 * parity check rather than a silent difference.
 */
import { COMPANY } from "./company"

/** One cleared repère: a short label and the approved value. */
export interface RepereFact {
  readonly label: string
  readonly value: string
}

/** The band, in the decided trame order (docs/homepage/README.md §3.4). */
export const REPERES: readonly RepereFact[] = [
  { label: "Expérience", value: COMPANY.experienceLine },
  { label: "Base", value: COMPANY.base },
  { label: "Métier", value: "Éclairage public" },
  { label: "Métier", value: "Réseaux HTA/MT & MT/BT" },
  { label: "Métier", value: "Postes de transformation" },
  { label: "Métier", value: "CFO/CFA" },
]
