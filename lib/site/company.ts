/**
 * Code-owned company identity — only facts cleared by
 * docs/company/facts-register.md §2 belong here.
 *
 * The identity block stays in code: it is never CMS-editable (SEO metadata
 * doc §3.1, legal pages doc). #21's content seam reads content, not identity.
 */
export const COMPANY = {
  brand: "HAY2010",
  legalName: "SOCIETE HAY 2010",
  /** Public general mailbox (facts register §2.3). */
  email: "contact@hay2010.ma",
  /** Registered seat (facts register §2.1) — one string, register wording. */
  registeredAddress: "Local N° 21, Hay El Manzeh, Hay Er-Riad, Rabat — Maroc",
  base: "Rabat — Maroc",
  /** Approved experience line, no founding year (facts register §2.2). */
  experienceLine: "Plus de 10 ans d’expérience",
  /** Footer legal line, fixed wording (brand direction §2.4). */
  legalLine: "© 2026 SOCIETE HAY 2010 — Tous droits réservés",
} as const

export const CONTACT_MAILTO = `mailto:${COMPANY.email}` as const
