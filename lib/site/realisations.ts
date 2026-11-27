/**
 * Réalisations — code-owned credentials rules (ticket #24).
 *
 * The page is credentials-led: it states what HAY2010 can prove and may show
 * (docs/content/realisations-strategy.md §1–§2), never a portfolio the company
 * cannot evidence. Two things around that copy are code-owned, because they are
 * compliance decisions rather than editorial choices:
 *
 * 1. **The qualification position.** The approved ONEE wording lives in
 *    `lib/site/claims.ts` and carries its own `live` gate: both certificates
 *    must be filed in this repository before any of it is published (facts
 *    register §2.2, §8 action 2). While the gate is closed the page prints
 *    `QUALIFICATIONS_POSITION` instead — an honest statement of what is
 *    verifiable today, with no agrément, certification or "entreprise agréée"
 *    claim and no placeholder.
 *
 * 2. **The named-case-study gate.** `/realisations/{slug}` turns on only once
 *    three approved named case studies exist, each with a client permission,
 *    a rights-cleared cover and releases for identifiable people (strategy §4,
 *    content model §5 `projects`). The gate stays code-owned and false, so the
 *    route family returns 404 and appears in no navigation, footer, sitemap or
 *    internal link (content-seam §5).
 */
import { APPROVED_CLAIMS, type ApprovedClaim } from "@/lib/site/claims"

/**
 * Named-case-study gate (strategy §4, content model §5).
 *
 * False until three approved named case studies exist. Flipping it is a
 * developer change that also needs the per-record lookup and permission checks
 * from #30 — this constant alone must never open the family.
 */
export const CASE_STUDIES_LIVE = false

/** Is the named-case-study family open? (checked by `resolveRouteGate`). */
export function caseStudiesLive(): boolean {
  return CASE_STUDIES_LIVE
}

/**
 * Honest qualification position while the ONEE claim gate is closed.
 *
 * It states the policy (only verifiable qualifications are shown) and the
 * current status (none is published on this page yet), then routes the visitor
 * to the reference request where the up-to-date position is communicated. It
 * deliberately names no authority, no certification and no agrément: the
 * gated wording stays out of every published page until both certificates are
 * filed. Code-owned so an editorial edit cannot turn it into a claim.
 */
export const QUALIFICATIONS_POSITION: readonly string[] = [
  "Nous ne présentons que des qualifications vérifiables\u00a0: rien n’est affiché que l’entreprise ne puisse justifier.",
  "Aucune qualification ne figure sur cette page à ce jour. L’état à jour des qualifications est communiqué sur demande, avec les références.",
]

/**
 * The approved qualifications claim, if and only if its publication gate is
 * open. `null` at P1 (both ONEE certificates are still outstanding), in which
 * case the renderer switches to `QUALIFICATIONS_POSITION` — never a placeholder
 * frame and never a blank block.
 */
export function getLiveQualificationsClaim(): ApprovedClaim | null {
  return (
    APPROVED_CLAIMS.find(
      (claim) => claim.key === "onee-agrements" && claim.live
    ) ?? null
  )
}
