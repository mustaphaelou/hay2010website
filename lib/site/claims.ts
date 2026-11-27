/**
 * Approved claims registry — code-owned, never CMS-editable.
 *
 * The facts register is the only source of approved wording
 * (docs/company/facts-register.md §2.2; content model §3: approved claims live
 * in code, not in Payload). A claim carries its own publication gate because
 * it may only be published once the named evidence is on file; while `live` is
 * false the claim is never rendered anywhere — no placeholder, no "à venir".
 *
 * ONEE agréments: the two current agréments are approved wording but both
 * certificates must be filed in this repository before publication (facts
 * register §2.2, §8 action 2). Until then `live` stays false and no page may
 * print "ONEE", "agréments" or a certified/agréé claim (SEO doc §3.3).
 * Never attribute the HTA-BT0 line to HAY2010 (it belongs to another company)
 * and never attach an ONEE agrément to postes de transformation.
 */
export interface ApprovedClaim {
  readonly key: "onee-agrements"
  /** Short heading of the claim block. */
  readonly title: string
  /** Approved wording, verbatim from the facts register. */
  readonly wording: string
  /** Domain slugs whose pages may display this claim. */
  readonly domains: readonly string[]
  /** Gate: false until the evidence named in the facts register is filed. */
  readonly live: boolean
}

export const APPROVED_CLAIMS: readonly ApprovedClaim[] = [
  {
    key: "onee-agrements",
    title: "Agréments ONEE",
    wording:
      "EE HTA-BT\u00a0: études des électrifications HTA-BT souterraines, BT aériennes et souterraines et bâtiment (02/10/2023 – 30/09/2028)\u00a0; HTA-BT3\u00a0: construction des réseaux HTA-BT (sans plafond) (25/03/2026 – 31/03/2029)",
    domains: ["infrastructures-reseaux-electriques"],
    live: false,
  },
]

/** Claims that may render on a domain page: live ones assigned to that domain. */
export function getLiveClaimsForDomain(domainSlug: string): ApprovedClaim[] {
  return APPROVED_CLAIMS.filter(
    (claim) => claim.live && claim.domains.includes(domainSlug)
  )
}
