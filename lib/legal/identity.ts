/**
 * The code-owned legal identity block and review date (ticket #28).
 *
 * Every value is copied character for character from
 * docs/company/facts-register.md §2.1 (`Value to publish`) and must never be
 * rewritten by hand: a typo here is a legal defect on two public pages. The
 * block is rendered by `components/site/legal-identity.tsx`; nothing in
 * `content/` may carry these strings (tests/architecture.test.ts guards it), so
 * the CMS admin cannot edit the identity (#30 verifies).
 *
 * Deliberately absent, per docs/legal/analytics-consent-legal-pages.md §4.2:
 * no publication director, no host line, no phone, no gérant/legal
 * representative line and no blank CNDP number. Do not add them here.
 */
export const LEGAL_IDENTITY = {
  legalName: "SOCIETE HAY 2010",
  legalForm: "Société à responsabilité limitée (SARL)",
  capital: "15 000 000 MAD",
  registeredAddress: "Local N° 21, Hay El Manzeh, Hay Er-Riad, Rabat — Maroc",
  rc: "RC 87305 — Tribunal de commerce de Rabat",
  ice: "001459327000056",
  /** Public general mailbox (facts register §2.3, peer of the footer). */
  email: "contact@hay2010.ma",
  /** Law 09-08 rights mailbox (§5.4). */
  dataEmail: "donnees@hay2010.ma",
  siteUrl: "https://hay2010.ma",
} as const

/**
 * Date of the last legal review, not the publication date: §4.1 says the
 * “Dernière mise à jour” line carries `lastReviewed`. The decision document
 * was last amended on 2026-11-09 (mailbox, forms and ONEE amendments); counsel
 * review is the public-launch gate owned by #16, not this ticket.
 */
export const LAST_REVIEWED = "2026-11-09" as const

/** The review date in the approved French long form (“9 novembre 2026”). */
export const LAST_REVIEWED_LABEL = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
}).format(new Date(`${LAST_REVIEWED}T00:00:00Z`))
